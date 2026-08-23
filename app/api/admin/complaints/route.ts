import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Build Prisma query filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (startDateStr || endDateStr) {
      where.createdAt = {};
      if (startDateStr) {
        where.createdAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        // Set end date to end of the day
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        resident: {
          select: {
            name: true,
            email: true,
            flatNumber: true,
          },
        },
      },
    });

    // Overdue Threshold Logic
    const thresholdDays = parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '3', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const complaintsWithFlags = complaints.map((c) => {
      const isOverdue = c.status !== 'RESOLVED' && new Date(c.createdAt) < cutoffDate;
      return {
        ...c,
        isOverdue,
      };
    });

    // Sort: Pinned Overdue at the top, then by createdAt descending
    complaintsWithFlags.sort((a, b) => {
      const aOverdue = a.isOverdue && a.status !== 'RESOLVED';
      const bOverdue = b.isOverdue && b.status !== 'RESOLVED';

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Secondary sorting: newer complaints first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(complaintsWithFlags);
  } catch (err) {
    console.error('[GET /api/admin/complaints]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Counts by status
    const statusCounts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusMap = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    statusCounts.forEach((c) => {
      if (c.status in statusMap) {
        statusMap[c.status as keyof typeof statusMap] = c._count.id;
      }
    });

    // 2. Counts by category
    const categoryCounts = await prisma.complaint.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const categoryMap = {
      Plumbing: 0,
      Electrical: 0,
      Cleaning: 0,
      Security: 0,
      Other: 0,
    };

    categoryCounts.forEach((c) => {
      if (c.category in categoryMap) {
        categoryMap[c.category as keyof typeof categoryMap] = c._count.id;
      }
    });

    // Convert category map to chart data array
    const chartData = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    // 3. Count of overdue complaints
    const thresholdDays = parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '3', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const overdueCount = await prisma.complaint.count({
      where: {
        status: {
          not: 'RESOLVED',
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // 4. Recent complaints
    const recentComplaints = await prisma.complaint.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        resident: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      statusCounts: statusMap,
      categoryCounts: chartData,
      overdueCount,
      recentComplaints,
    });
  } catch (err) {
    console.error('[GET /api/admin/dashboard]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

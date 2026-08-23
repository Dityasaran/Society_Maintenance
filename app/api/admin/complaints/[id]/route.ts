import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendStatusChangeEmail } from '@/lib/mail';
import { Status, Priority } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: {
          select: {
            name: true,
            email: true,
            flatNumber: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (err) {
    console.error('[GET /api/admin/complaints/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');

    if (!adminId || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, priority, note } = body;

    // Fetch existing complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const oldStatus = complaint.status;
    const oldPriority = complaint.priority;

    // Validate Status Lock
    if (oldStatus === 'RESOLVED' && status && status !== 'RESOLVED') {
      return NextResponse.json(
        { error: 'Resolved complaints are locked and cannot change status.' },
        { status: 400 }
      );
    }

    // Validate state transitions
    if (status) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
      }

      // Check transition: OPEN -> IN_PROGRESS -> RESOLVED
      if (oldStatus === 'OPEN' && status === 'RESOLVED') {
        return NextResponse.json(
          { error: 'Cannot transition directly from Open to Resolved. Please move to In Progress first.' },
          { status: 400 }
        );
      }
    }

    if (priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: 'Invalid priority value.' }, { status: 400 });
      }
    }

    // Update DB within a Transaction
    const updatedComplaint = await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      let statusChanged = false;
      let priorityChanged = false;

      if (status && status !== oldStatus) {
        updateData.status = status as Status;
        statusChanged = true;
        if (status === 'RESOLVED') {
          updateData.resolvedAt = new Date();
        }
      }

      if (priority && priority !== oldPriority) {
        updateData.priority = priority as Priority;
        priorityChanged = true;
      }

      if (!statusChanged && !priorityChanged) {
        // Nothing changed
        return complaint;
      }

      const updated = await tx.complaint.update({
        where: { id },
        data: updateData,
      });

      // Insert status history row
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          oldStatus: statusChanged ? oldStatus : null,
          newStatus: statusChanged ? (status as Status) : oldStatus,
          note: note || (priorityChanged ? `Priority updated from ${oldPriority} to ${priority}` : 'Complaint status updated.'),
          changedBy: adminId,
        },
      });

      return updated;
    });

    // Send email on status change
    if (status && status !== oldStatus) {
      sendStatusChangeEmail({
        residentName: complaint.resident.name,
        residentEmail: complaint.resident.email,
        complaintId: complaint.id,
        category: complaint.category,
        oldStatus: oldStatus,
        newStatus: status,
        note: note,
      }).catch((err) => {
        console.error('[PATCH /api/admin/complaints/[id]] Email dispatch error:', err);
      });
    }

    return NextResponse.json(updatedComplaint);
  } catch (err) {
    console.error('[PATCH /api/admin/complaints/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

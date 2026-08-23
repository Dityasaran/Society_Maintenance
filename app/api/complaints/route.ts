import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFile, validateFile } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    const residentId = req.headers.get('x-user-id');
    if (!residentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      where: { residentId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(complaints);
  } catch (err) {
    console.error('[GET /api/complaints]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const residentId = req.headers.get('x-user-id');
    if (!residentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const photo = formData.get('photo') as File | null;

    if (!category || !description?.trim()) {
      return NextResponse.json(
        { error: 'Category and description are required.' },
        { status: 400 }
      );
    }

    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      const validationError = validateFile(photo);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      const uploadResult = await uploadFile(photo);
      photoUrl = uploadResult.url;
    }

    // Wrap in a Prisma transaction to ensure complaint and status history are created together
    const newComplaint = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          residentId,
          category,
          description: description.trim(),
          photoUrl,
          priority: 'MEDIUM', // default
          status: 'OPEN', // default
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          oldStatus: null,
          newStatus: 'OPEN',
          note: 'Complaint registered by resident.',
          changedBy: residentId,
        },
      });

      return complaint;
    });

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (err) {
    console.error('[POST /api/complaints]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

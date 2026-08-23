import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendImportantNoticeEmail } from '@/lib/mail';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(notices);
  } catch (err) {
    console.error('[GET /api/notices]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');

    if (!adminId || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, body: noticeBody, isImportant } = body;

    if (!title?.trim() || !noticeBody?.trim()) {
      return NextResponse.json(
        { error: 'Title and body are required.' },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        body: noticeBody.trim(),
        isImportant: Boolean(isImportant),
        postedBy: adminId,
      },
    });

    if (notice.isImportant) {
      // Find all residents
      const residents = await prisma.user.findMany({
        where: { role: 'RESIDENT' },
        select: { name: true, email: true },
      });

      // Send email (background task wrapped in try/catch internally in lib/mail.ts)
      sendImportantNoticeEmail(residents, notice.title, notice.body).catch((err) => {
        console.error('[notices-api] Error sending notice emails:', err);
      });
    }

    return NextResponse.json(notice, { status: 201 });
  } catch (err) {
    console.error('[POST /api/notices]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

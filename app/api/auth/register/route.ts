import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, flatNumber } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !password || !flatNumber?.trim()) {
      return NextResponse.json(
        { error: 'name, email, password, and flatNumber are required.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role: 'RESIDENT', flatNumber: flatNumber.trim() },
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role, flatNumber: user.flatNumber } },
      { status: 201 }
    );
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

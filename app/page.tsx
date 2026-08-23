import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (payload) {
    if (payload.role === 'ADMIN') {
      redirect('/admin/dashboard');
    } else {
      redirect('/dashboard');
    }
  } else {
    redirect('/login');
  }
}

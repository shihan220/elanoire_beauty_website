import { redirect } from 'next/navigation';
import { getAdminSession } from '@/server/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
  const adminSession = await getAdminSession();

  if (adminSession) {
    redirect('/admin/dashboard');
  }

  redirect('/admin/login');
}

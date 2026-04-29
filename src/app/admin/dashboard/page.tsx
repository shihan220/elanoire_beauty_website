import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/app/components/admin/AdminDashboard';
import { getAdminSession } from '@/server/admin/auth';
import { getAdminDashboardData } from '@/server/admin/dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect('/admin/login');
  }

  const dashboardData = await getAdminDashboardData();

  return (
    <AdminDashboard
      initialData={dashboardData}
      adminEmail={adminSession.email}
    />
  );
}

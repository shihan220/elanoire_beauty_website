import { redirect } from 'next/navigation';
import { AccountDashboard } from '../components/account/AccountDashboard';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { getCurrentSession } from '@/server/auth';
import { getAccountDashboardData } from '@/server/account';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const accountData = await getAccountDashboardData(session.user.id);

  if (!accountData) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <AccountDashboard initialData={accountData} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

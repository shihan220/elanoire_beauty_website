import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AdminForgotPasswordForm } from '@/app/components/admin/AdminForgotPasswordForm';
import { getAdminSession } from '@/server/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminForgotPasswordPage() {
  const adminSession = await getAdminSession();

  if (adminSession) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="flex items-center justify-between gap-6 mb-16">
          <div>
            <span className="block text-[11px] tracking-[0.28em] uppercase text-stone-500 mb-3">
              Élanoire Beauty UK
            </span>
            <Link href="/" className="text-2xl md:text-3xl font-serif text-stone-900">
              Storefront
            </Link>
          </div>
          <Link
            href="/admin/login"
            className="text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
          >
            Admin Login
          </Link>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-16 lg:gap-24 items-start">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <KeyRound size={18} strokeWidth={1.5} className="text-stone-900" />
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500">
                Admin Password Recovery
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8 max-w-2xl">
              Keep admin access controlled and recoverable.
            </h1>
            <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
              This recovery entry point is prepared for the production admin auth provider. It does not expose secrets or send fake reset links.
            </p>
          </div>

          <AdminForgotPasswordForm />
        </section>
      </main>
    </div>
  );
}

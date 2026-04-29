'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AdminAuthMode } from '@/types/admin';

type LoginHint = {
  mode: AdminAuthMode;
  email: string;
  password: string | null;
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function AdminLoginForm({ credentialHint }: { credentialHint: LoginHint }) {
  const router = useRouter();
  const [email, setEmail] = useState(credentialHint.mode === 'mock' ? credentialHint.email : '');
  const [password, setPassword] = useState(credentialHint.password ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(body.errors ?? {});
        setFormError(body.message ?? 'Admin sign-in could not be completed.');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setFormError('Admin sign-in is unavailable right now. Try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border border-stone-200 bg-white/80 p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={18} strokeWidth={1.5} className="text-stone-900" />
        <p className="text-xs tracking-[0.24em] uppercase text-stone-500">Admin Access</p>
      </div>

      {credentialHint.mode === 'mock' ? (
        <div className="mb-8 border border-stone-200 bg-[#faf9f6] p-5">
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            Temporary local admin credentials are active until real role-based authentication is connected.
          </p>
          <div className="mt-4 space-y-2 text-sm text-stone-900">
            <p>Email: {credentialHint.email}</p>
            <p>Password: {credentialHint.password}</p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label htmlFor="admin-email" className="block text-xs tracking-[0.2em] uppercase text-stone-500 mb-3">
            Admin Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-4 text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          {errors.email ? <p className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">{errors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs tracking-[0.2em] uppercase text-stone-500 mb-3">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-4 text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          {errors.password ? <p className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">{errors.password}</p> : null}
        </div>

        {formError ? (
          <div className="border border-stone-200 bg-[#faf9f6] p-5">
            <p className="text-sm text-[var(--elanoire-color-destructive)]">{formError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Opening Dashboard' : 'Sign In'}
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-stone-600 font-light leading-relaxed">
          Replace this credential gate with real admin roles before production.
        </p>
        <Link
          href="/"
          className="text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors w-max"
        >
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState } from 'react';

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isEmail(email)) {
      setError('Enter a valid admin email address.');
      return;
    }

    setMessage('Admin recovery is ready for connection. Configure role-based admin auth and email delivery before production password reset emails are enabled.');
  }

  return (
    <div className="border border-stone-200 bg-white/80 p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <MailCheck size={18} strokeWidth={1.5} className="text-stone-900" />
        <p className="text-xs tracking-[0.24em] uppercase text-stone-500">Admin Recovery</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label htmlFor="admin-recovery-email" className="block text-xs tracking-[0.2em] uppercase text-stone-500 mb-3">
            Admin Email
          </label>
          <input
            id="admin-recovery-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-4 text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          {error ? <p className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">{error}</p> : null}
        </div>

        {message ? (
          <div className="border border-stone-200 bg-[#faf9f6] p-5">
            <p className="text-sm text-stone-600 font-light leading-relaxed">{message}</p>
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors"
        >
          Prepare Recovery
        </button>
      </form>

      <Link
        href="/admin/login"
        className="mt-10 inline-flex items-center gap-3 text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Login
      </Link>
    </div>
  );
}

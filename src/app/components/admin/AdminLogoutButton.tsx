'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="inline-flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <LogOut size={14} strokeWidth={1.5} />
      {isSubmitting ? 'Signing Out' : 'Sign Out'}
    </button>
  );
}

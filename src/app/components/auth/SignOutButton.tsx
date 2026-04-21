'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors w-max"
    >
      Sign Out
    </button>
  );
}

import Link from 'next/link';
import type { AdminDataMode } from '@/types/admin';

const navigationItems = [
  { href: '#overview', label: 'Overview' },
  { href: '#stock', label: 'Stock Updates' },
  { href: '#sales', label: 'Sales Statistics' },
  { href: '#newsletter', label: 'Newsletter Updates' },
  { href: '#products', label: 'Product Management' },
];

function ModeBadge({ label, mode }: { label: string; mode: AdminDataMode }) {
  return (
    <div className="border border-stone-200 bg-white/70 px-4 py-4">
      <span className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-2">
        {label}
      </span>
      <p className="text-sm text-stone-900">
        {mode === 'database' ? 'Live database' : 'Mock fallback'}
      </p>
    </div>
  );
}

export function AdminSidebar({
  adminEmail,
  dataMode,
  salesDataSource,
}: {
  adminEmail: string;
  dataMode: AdminDataMode;
  salesDataSource: AdminDataMode;
}) {
  return (
    <aside className="lg:sticky lg:top-8 space-y-8">
      <div className="border border-stone-200 bg-white/75 p-8">
        <span className="block text-[11px] tracking-[0.28em] uppercase text-stone-500 mb-4">
          Élanoire Admin
        </span>
        <h1 className="text-3xl font-serif text-stone-900 leading-tight mb-4">
          Business controls with a calm surface.
        </h1>
        <p className="text-sm text-stone-600 font-light leading-relaxed">
          Signed in as {adminEmail}.
        </p>
        <Link
          href="/"
          className="inline-flex mt-8 text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
        >
          View Storefront
        </Link>
      </div>

      <nav aria-label="Admin dashboard sections" className="border border-stone-200 bg-white/75 p-6">
        <ul className="space-y-4">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-sm tracking-[0.16em] uppercase text-stone-600 hover:text-stone-900 transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        <ModeBadge label="Product Source" mode={dataMode} />
        <ModeBadge label="Sales Source" mode={salesDataSource} />
      </div>
    </aside>
  );
}

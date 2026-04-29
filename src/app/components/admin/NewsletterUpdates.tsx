import type { NewsletterUpdate } from '@/types/admin';
import { formatDateLabel } from './admin-helpers';

export function NewsletterUpdates({ updates }: { updates: NewsletterUpdate[] }) {
  return (
    <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Newsletter Updates
          </span>
          <h3 className="text-2xl font-serif text-stone-900">Audience growth and contact health</h3>
        </div>
        <p className="text-sm text-stone-500">
          Replace this feed with your email platform sync when available.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-stone-200 text-[11px] tracking-[0.24em] uppercase text-stone-500">
              <th className="py-4 pr-6 font-medium">Subscriber</th>
              <th className="py-4 pr-6 font-medium">Source</th>
              <th className="py-4 pr-6 font-medium">Date</th>
              <th className="py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {updates.map((entry) => (
              <tr key={entry.id} className="border-b border-stone-100">
                <td className="py-5 pr-6 text-sm text-stone-900">{entry.email}</td>
                <td className="py-5 pr-6 text-sm text-stone-600">{entry.source}</td>
                <td className="py-5 pr-6 text-sm text-stone-600">{formatDateLabel(entry.subscribedAt)}</td>
                <td className="py-5">
                  <span className="inline-flex items-center border border-stone-300 bg-[#faf9f6] px-3 py-1 text-xs tracking-[0.18em] uppercase text-stone-700">
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

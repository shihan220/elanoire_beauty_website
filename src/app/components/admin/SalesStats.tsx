import type { AdminSalesSnapshot } from '@/types/admin';
import { formatCurrencyFromPence, formatDateLabel } from './admin-helpers';

export function SalesStats({ sales }: { sales: AdminSalesSnapshot }) {
  const highestRevenue = Math.max(...sales.salesSeries.map((entry) => entry.revenuePence), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
                Weekly Revenue
              </span>
              <h3 className="text-2xl font-serif text-stone-900">Recent performance</h3>
            </div>
            <p className="text-sm text-stone-500">Last six weeks</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end min-h-[14rem]">
            {sales.salesSeries.map((entry) => (
              <div key={entry.label} className="flex flex-col justify-end gap-3 h-full">
                <div className="relative h-44 border border-stone-200 bg-[#faf9f6] overflow-hidden">
                  <div
                    className="absolute inset-x-0 bottom-0 bg-stone-900/85 transition-[height] duration-300"
                    style={{
                      height: `${Math.max((entry.revenuePence / highestRevenue) * 100, 8)}%`,
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs tracking-[0.18em] uppercase text-stone-500">{entry.label}</p>
                  <p className="mt-2 text-sm text-stone-900">{formatCurrencyFromPence(entry.revenuePence)}</p>
                  <p className="mt-1 text-xs text-stone-500">{entry.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Best Sellers
          </span>
          <h3 className="text-2xl font-serif text-stone-900 mb-8">Top performing products</h3>
          <div className="space-y-5">
            {sales.bestSellers.length === 0 ? (
              <p className="text-sm text-stone-600 font-light leading-relaxed">
                Completed orders will populate product performance once checkout activity lands.
              </p>
            ) : (
              sales.bestSellers.map((item, index) => (
                <article key={item.name} className="flex items-start justify-between gap-4 border-t border-stone-200 pt-5">
                  <div>
                    <p className="text-xs tracking-[0.18em] uppercase text-stone-500 mb-2">#{index + 1}</p>
                    <h4 className="text-lg font-serif text-stone-900">{item.name}</h4>
                    <p className="mt-2 text-sm text-stone-600">{item.quantity} units sold</p>
                  </div>
                  <p className="text-sm text-stone-900">{formatCurrencyFromPence(item.revenuePence)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
              Recent Sales
            </span>
            <h3 className="text-2xl font-serif text-stone-900">Latest completed orders</h3>
          </div>
          <p className="text-sm text-stone-500">Revenue and customer detail snapshot</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] tracking-[0.24em] uppercase text-stone-500">
                <th className="py-4 pr-6 font-medium">Order</th>
                <th className="py-4 pr-6 font-medium">Customer</th>
                <th className="py-4 pr-6 font-medium">Items</th>
                <th className="py-4 pr-6 font-medium">Status</th>
                <th className="py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-stone-600 font-light">
                    No paid orders yet.
                  </td>
                </tr>
              ) : (
                sales.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 align-top">
                    <td className="py-5 pr-6">
                      <p className="text-sm text-stone-900">{order.id.slice(-8).toUpperCase()}</p>
                      <p className="mt-2 text-xs text-stone-500">{formatDateLabel(order.createdAt)}</p>
                    </td>
                    <td className="py-5 pr-6">
                      <p className="text-sm text-stone-900">{order.customerName || 'Guest Checkout'}</p>
                      <p className="mt-2 text-xs text-stone-500">{order.customerEmail}</p>
                    </td>
                    <td className="py-5 pr-6 text-sm text-stone-600">{order.itemCount}</td>
                    <td className="py-5 pr-6 text-sm text-stone-600 capitalize">{order.status.toLowerCase()}</td>
                    <td className="py-5 text-right text-sm text-stone-900">{formatCurrencyFromPence(order.totalPence)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

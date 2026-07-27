import type { AdminCustomerOrder } from '@/types/admin';
import { formatCurrencyFromPence, formatDateLabel } from './admin-helpers';

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function CustomerOrders({ orders }: { orders: AdminCustomerOrder[] }) {
  return (
    <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Customer Orders
          </span>
          <h3 className="text-2xl font-serif text-stone-900">Order details and customer records</h3>
        </div>
        <p className="text-sm text-stone-500">
          Latest customer activity from checkout and payment records.
        </p>
      </div>

      <div className="space-y-5">
        {orders.length === 0 ? (
          <div className="border border-stone-200 bg-[#faf9f6] p-6">
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              Customer order details will appear here once checkout orders are created.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <details key={order.id} className="group border border-stone-200 bg-[#faf9f6] open:bg-white/85">
              <summary className="list-none cursor-pointer p-5 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h4 className="text-xl font-serif text-stone-900">
                        Order {order.id.slice(-8).toUpperCase()}
                      </h4>
                      <span className="inline-flex items-center border border-stone-300 bg-white px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-stone-700">
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-900">{order.customerName || 'Guest Checkout'}</p>
                    <p className="mt-1 text-xs text-stone-500">{order.customerEmail}</p>
                    <p className="mt-3 text-xs tracking-[0.18em] uppercase text-stone-500">
                      {formatDateLabel(order.createdAt)}
                    </p>
                  </div>
                  <div className="lg:text-right">
                    <p className="text-xl font-serif text-stone-900">
                      {formatCurrencyFromPence(order.totalPence)}
                    </p>
                    <p className="mt-2 text-xs tracking-[0.18em] uppercase text-stone-500">
                      {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </summary>

              <div className="border-t border-stone-200 px-5 md:px-6 pb-6 pt-5 grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-6">
                <div>
                  <h5 className="text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-4">
                    Items
                  </h5>
                  <div className="divide-y divide-stone-200 border-y border-stone-200">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm text-stone-900">{item.name}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {item.quantity} x {formatCurrencyFromPence(item.pricePence)}
                          </p>
                        </div>
                        <p className="text-sm text-stone-900">
                          {formatCurrencyFromPence(item.quantity * item.pricePence)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="border border-stone-200 bg-white/80 p-5">
                  <h5 className="text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-4">
                    Billing
                  </h5>
                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    {order.billingSummary ?? 'No billing snapshot captured yet.'}
                  </p>
                  <div className="mt-6 border-t border-stone-200 pt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 text-stone-600">
                      <span>Subtotal</span>
                      <span>{formatCurrencyFromPence(order.subtotalPence)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-stone-900 font-serif">
                      <span>Total</span>
                      <span>{formatCurrencyFromPence(order.totalPence)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </details>
          ))
        )}
      </div>
    </section>
  );
}

'use client';

import { BarChart3, Boxes, Package, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { AdminDashboardData, AdminProductPayload, AdminProductRecord } from '@/types/admin';
import { AdminLogoutButton } from './AdminLogoutButton';
import { AdminSidebar } from './AdminSidebar';
import { NewsletterUpdates } from './NewsletterUpdates';
import { ProductManagementTable } from './ProductManagementTable';
import { SalesStats } from './SalesStats';
import { StatsCard } from './StatsCard';
import { StockManagementTable } from './StockManagementTable';
import { formatCurrencyFromPence } from './admin-helpers';

type MutationResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{
    message?: string;
    errors?: Record<string, string>;
    product?: AdminProductRecord;
  }>;
}

export function AdminDashboard({
  initialData,
  adminEmail,
}: {
  initialData: AdminDashboardData;
  adminEmail: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialData.products);
  const [bannerMessage, setBannerMessage] = useState('');
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => product.active);
    const lowStockProducts = activeProducts.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5);
    const outOfStockProducts = activeProducts.filter((product) => product.stockQuantity <= 0);

    return {
      totalProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      newsletterCount: initialData.newsletterUpdates.length,
    };
  }, [initialData.newsletterUpdates.length, products]);

  async function withAdminGuard<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      throw error;
    }
  }

  async function patchProduct(productId: string, payload: Partial<AdminProductPayload>): Promise<MutationResult> {
    setBusyProductId(productId);
    setBannerMessage('');

    try {
      return await withAdminGuard(async () => {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const body = await readJson(response);

        if (response.status === 401) {
          router.push('/admin/login');
          router.refresh();
          return { error: 'Admin session expired. Sign in again.' };
        }

        if (!response.ok || !body.product) {
          return {
            error: body.message ?? 'Product changes could not be saved.',
            fieldErrors: body.errors,
          };
        }

        setProducts((current) => current.map((product) => (
          product.id === productId ? body.product as AdminProductRecord : product
        )));
        setBannerMessage('Catalogue changes saved.');

        return {};
      });
    } catch {
      return { error: 'Product changes could not be saved.' };
    } finally {
      setBusyProductId(null);
    }
  }

  async function createProduct(payload: AdminProductPayload): Promise<MutationResult> {
    setIsCreating(true);
    setBannerMessage('');

    try {
      return await withAdminGuard(async () => {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const body = await readJson(response);

        if (response.status === 401) {
          router.push('/admin/login');
          router.refresh();
          return { error: 'Admin session expired. Sign in again.' };
        }

        if (!response.ok || !body.product) {
          return {
            error: body.message ?? 'Product creation could not be completed.',
            fieldErrors: body.errors,
          };
        }

        setProducts((current) => [body.product as AdminProductRecord, ...current]);
        setBannerMessage('New product added.');
        return {};
      });
    } catch {
      return { error: 'Product creation could not be completed.' };
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteProduct(productId: string): Promise<MutationResult> {
    setBusyProductId(productId);
    setBannerMessage('');

    try {
      return await withAdminGuard(async () => {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
        const body = await readJson(response);

        if (response.status === 401) {
          router.push('/admin/login');
          router.refresh();
          return { error: 'Admin session expired. Sign in again.' };
        }

        if (!response.ok || !body.product) {
          return { error: body.message ?? 'Product removal could not be completed.' };
        }

        setProducts((current) => current.map((product) => (
          product.id === productId ? body.product as AdminProductRecord : product
        )));
        setBannerMessage('Product archived from the storefront.');
        return {};
      });
    } catch {
      return { error: 'Product removal could not be completed.' };
    } finally {
      setBusyProductId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <main className="max-w-[1600px] mx-auto px-6 md:px-10 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
          <AdminSidebar
            adminEmail={adminEmail}
            dataMode={initialData.dataMode}
            salesDataSource={initialData.salesDataSource}
          />

          <div className="space-y-8 md:space-y-10">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border border-stone-200 bg-white/80 p-6 md:p-8">
              <div>
                <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-4">
                  Admin Dashboard
                </span>
                <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight">
                  Manage inventory, revenue, and customer signals in one view.
                </h2>
              </div>
              <AdminLogoutButton />
            </header>

            {bannerMessage ? (
              <div className="border border-stone-200 bg-white/75 px-5 py-4">
                <p className="text-sm text-stone-600">{bannerMessage}</p>
              </div>
            ) : null}

            <section id="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 gap-6">
                <StatsCard
                  label="Total Products"
                  value={String(metrics.totalProducts)}
                  hint="Currently active across skincare, makeup, and fragrance."
                />
                <StatsCard
                  label="Low Stock"
                  value={String(metrics.lowStockProducts)}
                  hint="Lines needing a replenishment decision soon."
                />
                <StatsCard
                  label="Out of Stock"
                  value={String(metrics.outOfStockProducts)}
                  hint="Unavailable products that are no longer sellable."
                />
                <StatsCard
                  label="Total Sales"
                  value={formatCurrencyFromPence(initialData.sales.totalRevenuePence)}
                  hint={`${initialData.sales.totalOrders} paid or fulfilled orders tracked.`}
                />
                <StatsCard
                  label="Newsletter Contacts"
                  value={String(metrics.newsletterCount)}
                  hint="Current admin-side audience snapshot entries."
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {[
                  {
                    icon: Boxes,
                    title: 'Product operations',
                    text: 'Adjust stock, pricing, descriptions, and product visibility without leaving the dashboard.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Sales clarity',
                    text: 'Track total revenue, order flow, best sellers, and short-term performance without clutter.',
                  },
                  {
                    icon: Users,
                    title: 'Audience updates',
                    text: 'Monitor newsletter opt-ins and leave the structure ready for your email provider sync.',
                  },
                  {
                    icon: Sparkles,
                    title: 'Luxury brand continuity',
                    text: 'Admin surfaces stay aligned with the existing Élanoire palette and editorial spacing.',
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.title} className="border border-stone-200 bg-white/80 p-6">
                      <Icon size={20} strokeWidth={1.5} className="text-stone-900 mb-5" />
                      <h3 className="text-xl font-serif text-stone-900 mb-3">{item.title}</h3>
                      <p className="text-sm text-stone-600 font-light leading-relaxed">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="stock">
              <StockManagementTable
                products={products}
                savingProductId={busyProductId}
                onUpdateStock={async (productId, stockQuantity) => patchProduct(productId, { stockQuantity })}
              />
            </section>

            <section id="sales">
              <SalesStats sales={initialData.sales} />
            </section>

            <section id="newsletter">
              <NewsletterUpdates updates={initialData.newsletterUpdates} />
            </section>

            <section id="products">
              <ProductManagementTable
                products={products}
                dataMode={initialData.dataMode}
                creating={isCreating}
                busyProductId={busyProductId}
                onCreate={createProduct}
                onUpdate={async (productId, payload) => patchProduct(productId, payload)}
                onDelete={deleteProduct}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

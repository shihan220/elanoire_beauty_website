import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { getCurrentSession } from '@/server/auth';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

function formatCategory(category: string) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export default async function CheckoutPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      billingProfiles: {
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        take: 1,
      },
      cartItems: {
        orderBy: { createdAt: 'asc' },
        include: { product: true },
      },
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  const activeCartItems = user.cartItems.filter((item) => item.product.active && item.quantity > 0);
  const subtotalPence = activeCartItems.reduce(
    (total, item) => total + item.product.pricePence * item.quantity,
    0,
  );
  const savedBilling = user.billingProfiles[0] ?? null;
  const defaultBilling = savedBilling
    ? {
        fullName: savedBilling.fullName,
        email: savedBilling.email,
        phone: savedBilling.phone,
        country: savedBilling.country,
        line1: savedBilling.line1,
        line2: savedBilling.line2 ?? '',
        city: savedBilling.city,
        region: savedBilling.region,
        postcode: savedBilling.postcode,
      }
    : {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: '',
        country: 'United Kingdom',
        line1: '',
        line2: '',
        city: '',
        region: '',
        postcode: '',
      };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-16 lg:gap-24 items-start mb-20">
            <div>
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                Secure Checkout
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
                Complete your ritual.
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Confirm billing details and continue to Stripe for secure card payment.
              </p>
            </div>

            <div className="border-t border-stone-300 pt-10">
              <div className="flex items-center justify-between gap-8">
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">
                    Checkout
                  </span>
                  <p className="text-3xl font-serif text-stone-900">
                    {activeCartItems.length} item{activeCartItems.length === 1 ? '' : 's'}
                  </p>
                </div>
                <ShoppingBag size={42} strokeWidth={1.2} className="text-stone-900" />
              </div>
            </div>
          </div>

          {activeCartItems.length === 0 ? (
            <div className="border border-stone-200 bg-[#faf9f6] p-8 md:p-12 max-w-3xl">
              <h2 className="text-3xl font-serif text-stone-900 mb-4">
                Your bag is empty.
              </h2>
              <p className="text-stone-600 font-light leading-relaxed mb-10 max-w-xl">
                Add products to your bag before beginning checkout.
              </p>
              <Link href="/cart" className="inline-flex items-center justify-center px-10 py-4 bg-stone-900 text-[#faf9f6] text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors">
                Return To Bag
              </Link>
            </div>
          ) : (
            <CheckoutForm
              items={activeCartItems.map((item) => ({
                id: item.id,
                name: item.product.name,
                category: formatCategory(item.product.category),
                quantity: item.quantity,
                pricePence: item.product.pricePence,
                lineTotalPence: item.product.pricePence * item.quantity,
              }))}
              subtotalPence={subtotalPence}
              initialBilling={defaultBilling}
              hasSavedBilling={Boolean(savedBilling)}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

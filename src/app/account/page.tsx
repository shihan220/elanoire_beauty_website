import Link from 'next/link';
import { ArrowRight, MapPin, Package, Settings, User } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

const accountSections = [
  {
    title: 'Profile Details',
    icon: User,
    description: 'Personal information for checkout and order communication.',
  },
  {
    title: 'Order History',
    icon: Package,
    description: 'A refined view of recent purchases and order progress.',
  },
  {
    title: 'Saved Addresses',
    icon: MapPin,
    description: 'Delivery destinations for a faster checkout experience.',
  },
  {
    title: 'Settings',
    icon: Settings,
    description: 'Preferences for account security and communication.',
  },
];

// TODO(account): replace staged customer values with authenticated account data once auth/session storage is connected.

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-4 block">
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
        {title}
      </h2>
      <p className="text-stone-600 font-light leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-stone-200 bg-[#faf9f6] p-8 md:p-10">
      <h3 className="text-xl font-serif text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-600 font-light leading-relaxed mb-8 max-w-xl">
        {description}
      </p>
      {action}
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-16 lg:gap-24 items-start mb-24">
            <div>
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                Account
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
                Your Élanoire space.
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                A calm home for profile details, order history, saved addresses, and account preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {accountSections.map((section) => {
                const Icon = section.icon;

                return (
                  <div key={section.title} className="border-t border-stone-300 pt-6">
                    <Icon size={22} strokeWidth={1.5} className="text-stone-900 mb-6" />
                    <h2 className="text-xl font-serif text-stone-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-sm text-stone-600 font-light leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-20">
            <section id="profile" className="border-t border-stone-200 pt-12">
              <SectionHeading
                eyebrow="Profile"
                title="Profile Details"
                description="Backend authentication is not connected yet, so this section is prepared for the authenticated user record."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border-b border-stone-300 pb-5">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">Name</span>
                  <p className="text-stone-900">Guest Customer</p>
                </div>
                <div className="border-b border-stone-300 pb-5">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">Email</span>
                  <p className="text-stone-900">Not connected</p>
                </div>
                <div className="border-b border-stone-300 pb-5">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">Status</span>
                  <p className="text-stone-900">Awaiting sign in integration</p>
                </div>
              </div>
            </section>

            <section id="orders" className="border-t border-stone-200 pt-12">
              <SectionHeading
                eyebrow="Orders"
                title="Order History"
                description="Recent purchases will appear here once the checkout and account backend are connected."
              />
              <EmptyState
                title="No orders yet"
                description="Your first Élanoire purchase will be listed here with status, totals, and delivery details."
                action={
                  <Link href="/" className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors">
                    Continue Shopping
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                }
              />
            </section>

            <section id="addresses" className="border-t border-stone-200 pt-12">
              <SectionHeading
                eyebrow="Delivery"
                title="Saved Addresses"
                description="Saved delivery details will support faster checkout once customer storage is available."
              />
              <EmptyState
                title="No saved addresses"
                description="Address management is ready for backend persistence and checkout integration."
                action={
                  <button type="button" className="px-8 py-4 border border-stone-300 text-stone-500 text-sm tracking-[0.2em] uppercase cursor-not-allowed">
                    Add Address Soon
                  </button>
                }
              />
            </section>

            <section id="settings" className="border-t border-stone-200 pt-12">
              <SectionHeading
                eyebrow="Preferences"
                title="Settings"
                description="Basic account preferences are staged for authenticated profile storage."
              />
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {['Newsletter edits', 'Order updates', 'Early access invitations'].map((item) => (
                  <div key={item} className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-stone-900">{item}</h3>
                      <p className="text-sm text-stone-600 font-light mt-2">
                        Preference will be saved after account backend connection.
                      </p>
                    </div>
                    <span className="text-xs tracking-[0.2em] uppercase text-stone-500">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

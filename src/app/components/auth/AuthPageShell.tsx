import Link from 'next/link';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  asideTitle: string;
  asideText: string;
  asideLinkHref: string;
  asideLinkLabel: string;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  asideTitle,
  asideText,
  asideLinkHref,
  asideLinkLabel,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-24 items-start">
            <div>
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                {eyebrow}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8 max-w-2xl">
                {title}
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                {description}
              </p>
            </div>

            <div className="border-t border-stone-300 pt-10">
              {children}
            </div>
          </div>

          <div className="mt-24 md:mt-32 border-t border-stone-200 pt-10 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr_auto] gap-8 md:items-center">
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900">
              {asideTitle}
            </h2>
            <p className="text-stone-600 font-light leading-relaxed max-w-2xl">
              {asideText}
            </p>
            <Link
              href={asideLinkHref}
              className="text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors w-max"
            >
              {asideLinkLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

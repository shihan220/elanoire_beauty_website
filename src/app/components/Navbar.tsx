'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './cart/CartProvider';

type DesktopDropdownLink = {
  label: string;
  href: string;
};

type DesktopNavItem = {
  label: string;
  href: string;
  dropdownTitle?: string;
  dropdownDescription?: string;
  dropdownLinks?: DesktopDropdownLink[];
};

const desktopNavItems: DesktopNavItem[] = [
  {
    label: 'Shop',
    href: '/products',
  },
  {
    label: 'Skincare',
    href: '/skincare',
    dropdownTitle: 'Skincare Edit',
    dropdownDescription: 'Refined essentials for cleansing, treatment, hydration, and daily protection.',
    dropdownLinks: [
      { label: 'Cleansers', href: '/skincare?search=cleanser' },
      { label: 'Toners', href: '/skincare?search=toner' },
      { label: 'Serums', href: '/skincare?search=serum' },
      { label: 'Moisturisers', href: '/skincare?search=cream' },
      { label: 'Sunscreen', href: '/skincare?search=sunscreen' },
      { label: 'Face Masks', href: '/skincare?search=mask' },
    ],
  },
  {
    label: 'Makeup',
    href: '/makeup',
    dropdownTitle: 'Makeup Edit',
    dropdownDescription: 'Quietly polished colour across complexion, lips, lashes, cheeks, and eyes.',
    dropdownLinks: [
      { label: 'Foundation', href: '/makeup?search=foundation' },
      { label: 'Concealer', href: '/makeup?search=concealer' },
      { label: 'Lipstick', href: '/makeup?search=lipstick' },
      { label: 'Mascara', href: '/makeup?search=mascara' },
      { label: 'Blush', href: '/makeup?search=blush' },
      { label: 'Eyeshadow', href: '/makeup?search=eyeshadow' },
    ],
  },
  {
    label: 'About',
    href: '/#philosophy',
  },
];

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();

    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  }

  function closeMobileMenus() {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#faf9f6]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6 md:hidden">
            <button type="button" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-stone-900">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen((currentValue) => !currentValue)}
              className="p-2 text-stone-900 md:hidden"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="hidden md:block" aria-label="Primary navigation">
            <ul className="flex items-center gap-8">
              {desktopNavItems.map((item) => {
                const hasDropdown = Boolean(item.dropdownLinks?.length);

                return (
                  <li key={item.label} className={`relative ${hasDropdown ? 'group/nav-item' : ''}`}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 py-3 text-sm tracking-widest uppercase text-stone-900 hover:text-stone-500 focus-visible:text-stone-500 transition-colors"
                      aria-haspopup={hasDropdown ? 'menu' : undefined}
                    >
                      <span>{item.label}</span>
                      {hasDropdown ? (
                        <ChevronDown
                          size={14}
                          strokeWidth={1.5}
                          className="text-stone-400 transition-transform duration-300 group-hover/nav-item:rotate-180 group-focus-within/nav-item:rotate-180"
                        />
                      ) : null}
                    </Link>

                    {hasDropdown ? (
                      <div className="pointer-events-none absolute left-1/2 top-full z-[70] w-[32rem] -translate-x-1/2 pt-4 group-hover/nav-item:pointer-events-auto group-focus-within/nav-item:pointer-events-auto">
                        <div className="invisible translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover/nav-item:visible group-hover/nav-item:translate-y-0 group-hover/nav-item:opacity-100 group-focus-within/nav-item:visible group-focus-within/nav-item:translate-y-0 group-focus-within/nav-item:opacity-100">
                          <div className="border border-stone-200 bg-[#faf9f6]/95 backdrop-blur-md shadow-[0_24px_60px_rgba(41,37,36,0.08)]">
                            <div className="grid grid-cols-[0.88fr_1.12fr] gap-10 p-7">
                              <div className="border-r border-stone-200 pr-8">
                                <span className="text-[0.65rem] tracking-[0.28em] uppercase text-stone-500 block mb-3">
                                  {item.label}
                                </span>
                                <h2 className="text-2xl font-serif text-stone-900 mb-4">
                                  {item.dropdownTitle}
                                </h2>
                                <p className="text-sm text-stone-600 font-light leading-relaxed">
                                  {item.dropdownDescription}
                                </p>
                                <Link
                                  href={item.href}
                                  className="inline-flex items-center gap-2 mt-6 text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
                                >
                                  Shop {item.label}
                                </Link>
                              </div>

                              <ul className="grid grid-cols-2 gap-x-8 gap-y-4" aria-label={`${item.label} categories`}>
                                {item.dropdownLinks?.map((dropdownLink) => (
                                  <li key={dropdownLink.label}>
                                    <Link
                                      href={dropdownLink.href}
                                      className="block border-b border-stone-200 pb-3 text-sm text-stone-700 hover:text-stone-900 hover:border-stone-900 focus-visible:text-stone-900 focus-visible:border-stone-900 transition-colors"
                                    >
                                      {dropdownLink.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-serif tracking-wide text-stone-900">ÉLANOIRE</h1>
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 -mt-1">Beauty UK</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen((currentValue) => !currentValue)}
              className="hidden md:block p-2 text-stone-900 hover:text-stone-500 transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/sign-in" aria-label="Account sign in" className="hidden md:block p-2 text-stone-900 hover:text-stone-500 transition-colors">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/cart" aria-label="Shopping bag" className="p-2 text-stone-900 hover:text-stone-500 transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-stone-900 text-[#faf9f6] text-[10px] leading-5 text-center rounded-full">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-[84px] md:top-[96px] left-0 right-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-y border-stone-200"
          >
            <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center gap-4">
              <Search size={18} strokeWidth={1.5} className="text-stone-500 shrink-0" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                type="search"
                autoComplete="off"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search skincare, makeup, fragrance"
                className="min-w-0 flex-1 bg-transparent border-0 py-3 text-stone-900 placeholder:text-stone-400 outline-none"
              />
              <button
                type="submit"
                className="text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-[#faf9f6] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                  <span className="text-xl font-serif tracking-wide">ÉLANOIRE</span>
                  <span className="text-[0.55rem] tracking-[0.2em] uppercase text-stone-500 -mt-0.5">Beauty UK</span>
                </div>
                <button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-stone-500">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-6">
                <Link href="/products" onClick={closeMobileMenus} className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Shop All</Link>
                <Link href="/skincare" onClick={closeMobileMenus} className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Skincare</Link>
                <Link href="/makeup" onClick={closeMobileMenus} className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Makeup</Link>
                <Link href="/#philosophy" onClick={closeMobileMenus} className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">About Us</Link>
                <Link href="/#contact" onClick={closeMobileMenus} className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Contact</Link>
              </nav>

              <div className="mt-auto absolute bottom-8 left-8 right-8 flex gap-4 pt-8 border-t border-stone-200">
                <Link href="/sign-in" onClick={closeMobileMenus} className="flex items-center gap-2 text-sm uppercase tracking-widest text-stone-500">
                  <User size={18} strokeWidth={1.5} />
                  Account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

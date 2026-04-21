'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './cart/CartProvider';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-stone-900">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <button className="p-2 text-stone-900 md:hidden">
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Shop</Link>
            <Link href="/skincare" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Skincare</Link>
            <Link href="/makeup" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Makeup</Link>
            <Link href="/#philosophy" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">About</Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-serif tracking-wide text-stone-900">ÉLANOIRE</h1>
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 -mt-1">Beauty UK</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden md:block p-2 text-stone-900 hover:text-stone-500 transition-colors">
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
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-stone-500">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-6">
                <Link href="/products" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Shop All</Link>
                <Link href="/skincare" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Skincare</Link>
                <Link href="/makeup" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Makeup</Link>
                <Link href="/#philosophy" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">About Us</Link>
                <Link href="/#contact" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Contact</Link>
              </nav>

              <div className="mt-auto absolute bottom-8 left-8 right-8 flex gap-4 pt-8 border-t border-stone-200">
                <Link href="/sign-in" className="flex items-center gap-2 text-sm uppercase tracking-widest text-stone-500">
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

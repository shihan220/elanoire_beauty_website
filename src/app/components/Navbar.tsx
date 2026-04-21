'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <a href="#" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Shop</a>
            <a href="#" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Skincare</a>
            <a href="#" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">Makeup</a>
            <a href="#" className="text-sm tracking-widest uppercase hover:text-stone-500 transition-colors">About</a>
          </nav>

          <a href="#" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-serif tracking-wide text-stone-900">ÉLANOIRE</h1>
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 -mt-1">Beauty UK</span>
          </a>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden md:block p-2 text-stone-900 hover:text-stone-500 transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button className="hidden md:block p-2 text-stone-900 hover:text-stone-500 transition-colors">
              <User size={20} strokeWidth={1.5} />
            </button>
            <button className="p-2 text-stone-900 hover:text-stone-500 transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-stone-900 rounded-full"></span>
            </button>
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
                <a href="#" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Shop All</a>
                <a href="#" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Skincare</a>
                <a href="#" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Makeup</a>
                <a href="#" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">About Us</a>
                <a href="#" className="text-lg tracking-wider uppercase text-stone-900 pb-4 border-b border-stone-200">Contact</a>
              </nav>

              <div className="mt-auto absolute bottom-8 left-8 right-8 flex gap-4 pt-8 border-t border-stone-200">
                <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-stone-500">
                  <User size={18} strokeWidth={1.5} />
                  Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

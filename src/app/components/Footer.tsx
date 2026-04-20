import React from 'react';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-100 py-24 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-serif text-stone-900 mb-2">ÉLANOIRE</h2>
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 mb-8 block">Beauty UK</span>
          <p className="text-stone-600 max-w-sm mb-12 font-light">
            Elevating your daily beauty ritual with elegant, effective skincare and makeup solutions.
          </p>
          
          <div className="flex flex-col gap-4 max-w-sm">
            <span className="text-xs tracking-[0.2em] uppercase text-stone-900 font-medium">Join the Newsletter</span>
            <div className="flex border-b border-stone-300 pb-2 focus-within:border-stone-900 transition-colors">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent w-full outline-none text-stone-900 placeholder:text-stone-400 text-sm"
              />
              <button className="text-stone-900 hover:text-stone-500 transition-colors">
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase text-stone-900 font-medium mb-8">Shop</h3>
          <ul className="flex flex-col gap-4 text-sm text-stone-600">
            <li><a href="#" className="hover:text-stone-900 transition-colors">All Products</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Skincare</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Makeup</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Gifts & Sets</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Bestsellers</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase text-stone-900 font-medium mb-8">About</h3>
          <ul className="flex flex-col gap-4 text-sm text-stone-600">
            <li><a href="#" className="hover:text-stone-900 transition-colors">Our Story</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Ingredients</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Sustainability</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-stone-900 transition-colors">FAQ</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24 pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs tracking-wider text-stone-500">
          © {new Date().getFullYear()} ÉLANOIRE BEAUTY UK. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
            <Instagram size={20} strokeWidth={1.5} />
          </a>
          <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
            <Twitter size={20} strokeWidth={1.5} />
          </a>
          <a href="#" className="text-stone-500 hover:text-stone-900 transition-colors">
            <Facebook size={20} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}

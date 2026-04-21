'use client';

import React from 'react';
import { motion } from 'motion/react';

export function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] w-full bg-stone-100 flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="https://images.unsplash.com/photo-1728727187824-85f1c610a671?auto=format&fit=crop&q=80&w=2000"
          alt="Elegant woman with natural makeup"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/20" /> {/* Subtle overlay for text readability */}
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center mt-24">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <span className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-stone-50 mb-6 drop-shadow-sm">
            Discover True Elegance
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-wide text-[#faf9f6] mb-8 leading-tight drop-shadow-md max-w-4xl">
            Unveil Your Natural Radiance
          </h1>
          <p className="text-lg md:text-xl text-stone-100 max-w-xl mb-12 font-light drop-shadow-sm">
            Luxurious skincare and elegant makeup crafted for the modern individual.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="px-10 py-4 bg-[#faf9f6] text-stone-900 text-sm tracking-[0.2em] uppercase hover:bg-stone-200 transition-colors">
              Shop Skincare
            </button>
            <button className="px-10 py-4 border border-[#faf9f6] text-[#faf9f6] text-sm tracking-[0.2em] uppercase hover:bg-[#faf9f6] hover:text-stone-900 transition-colors backdrop-blur-sm">
              Explore Makeup
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-stone-100">Scroll</span>
        <div className="w-[1px] h-12 bg-stone-100/30 overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-full h-1/2 bg-stone-100"
          />
        </div>
      </motion.div>
    </section>
  );
}

'use client';

import React from 'react';
import { motion } from 'motion/react';

export function AboutSection() {
  return (
    <section className="bg-stone-900 text-[#faf9f6] py-32 md:py-48 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-800/20 blur-3xl -z-10 rounded-full mix-blend-screen" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-xs font-medium tracking-[0.4em] uppercase text-stone-400 mb-8 block">
            The Philosophy
          </span>
          <h2 className="text-4xl md:text-6xl font-serif leading-tight mb-12">
            Beauty rooted in elegance and mindful simplicity.
          </h2>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-16">
            At Élanoire Beauty UK, we believe true luxury whispers. Our formulations combine high-performance active ingredients with gentle botanical extracts, creating rituals that celebrate your natural radiance without compromise.
          </p>
          <a href="#" className="inline-block border border-stone-600 px-10 py-4 text-sm tracking-[0.2em] uppercase hover:bg-[#faf9f6] hover:text-stone-900 transition-colors duration-300">
            Discover Our Story
          </a>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Categories() {
  const categories = [
    {
      title: "Skincare",
      href: "/skincare",
      image: "https://images.unsplash.com/photo-1703153855607-942d04ef96cd?auto=format&fit=crop&q=80&w=1080",
      desc: "Nourish and protect your natural glow with our carefully formulated skincare line."
    },
    {
      title: "Makeup",
      href: "/makeup",
      image: "https://images.unsplash.com/photo-1512206879471-b4d119aef899?auto=format&fit=crop&q=80&w=1080",
      desc: "Enhance your beauty with elegant, high-performance makeup essentials."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {categories.map((category, index) => (
            <motion.div 
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="flex-1"
            >
              <Link href={category.href} className="group relative overflow-hidden h-[600px] cursor-pointer block">
                <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/30 transition-colors duration-700 z-10" />
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-12">
                  <h3 className="text-3xl md:text-4xl font-serif text-[#faf9f6] mb-4">
                    {category.title}
                  </h3>
                  <p className="text-stone-100 max-w-sm mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 transform">
                    {category.desc}
                  </p>

                  <div className="flex items-center gap-4 text-[#faf9f6] text-sm tracking-[0.2em] uppercase w-max group-hover:gap-6 transition-all duration-300">
                    <span className="border-b border-transparent group-hover:border-[#faf9f6] pb-1 transition-colors">
                      Shop {category.title}
                    </span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

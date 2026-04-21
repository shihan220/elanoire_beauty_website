'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { featuredProducts } from '@/data/products';
import { useCart } from './cart/CartProvider';

export function Bestsellers() {
  const containerRef = useRef(null);
  const { addItem } = useCart();
  
  // Track scroll position for the entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section id="collection" ref={containerRef} className="py-24 md:py-32 bg-stone-100 overflow-hidden relative" style={{ position: 'relative' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-4 block">
              Curated Selection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900">
              The Collection
            </h2>
          </div>
          <Link href="/products" className="text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors inline-block w-max">
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 pb-24">
          {featuredProducts.map((product, index) => {
            // Map scroll progress to a vertical displacement to create anti-gravity parallax
            // Slower items move less, faster items move more as the user scrolls down
            const yTransform = useTransform(
              scrollYProgress, 
              [0, 1], 
              [100 * product.speed, -400 * product.speed]
            );

            // Staggering columns to create a more organic, floating layout
            const getLayoutStagger = () => {
              const col = index % 3;
              const mdCol = index % 2;
              let classes = "";
              
              if (mdCol === 1) classes += "md:mt-16 ";
              else classes += "md:mt-0 ";

              if (col === 1) classes += "lg:mt-32";
              else if (col === 2) classes += "lg:mt-16";
              else classes += "lg:mt-0";

              return classes;
            };
            
            return (
              <motion.div
                key={product.id}
                style={{ y: yTransform }}
                className={`flex flex-col ${getLayoutStagger()}`}
              >
                {/* 1. Initial fade up into view */}
                <motion.div
                  initial={{ opacity: 0, y: 150 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "100px 0px -100px 0px" }}
                  transition={{ duration: 1.2, delay: (index % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {/* 2. Continuous anti-gravity bobbing motion */}
                  <motion.div
                    animate={{ y: [0, -25, 0] }}
                    transition={{ 
                      duration: product.floatDuration, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.3 // offset the start of the bobbing
                    }}
                    className="group cursor-pointer flex flex-col h-full"
                  >
                     <div className="relative aspect-[3/4] mb-8 overflow-hidden bg-stone-200 shadow-sm transition-shadow duration-700 hover:shadow-xl">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      
                      {/* Hover Add to Cart Button */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <button
                          type="button"
                          onClick={() => addItem(product.id)}
                          className="w-full bg-[#faf9f6]/95 backdrop-blur-md text-stone-900 py-4 flex items-center justify-center gap-3 hover:bg-[#faf9f6] transition-colors shadow-lg"
                        >
                          <ShoppingBag size={18} strokeWidth={1.5} />
                          <span className="text-xs tracking-[0.2em] uppercase font-medium">Add to Bag</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow text-center pb-8">
                      <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
                        {product.category}
                      </span>
                      <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-sm text-stone-900 font-medium">
                        {product.priceLabel}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

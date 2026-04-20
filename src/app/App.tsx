import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { Bestsellers } from './components/Bestsellers';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Bestsellers />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

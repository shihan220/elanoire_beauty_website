import { AboutSection } from './components/AboutSection';
import { Bestsellers } from './components/Bestsellers';
import { Categories } from './components/Categories';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';

export default function HomePage() {
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

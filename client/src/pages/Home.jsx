import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, Palette } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data.slice(0, 8));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f4f0]">
      
      {/* ══════════════════════════════════════════════════
          MAGAZINE HERO SECTION (EXACT SPLIT DESIGN)
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-[#442828]">
          
          {/* LEFT COLUMN: Editorial Brand Block */}
          <div className="lg:col-span-4 bg-[#4b2c2c] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background monogram */}
            <div className="absolute -right-10 -bottom-10 text-[180px] font-serif font-black text-white/5 pointer-events-none select-none">
              ID
            </div>

            <div>
              <span className="inline-block text-[#d4a56a] font-serif tracking-[0.25em] text-xs uppercase font-bold mb-4">
                Architecture & Interiors
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight mb-4">
                INTRA <br />
                <span className="text-[#d4a56a]">DECOR</span>
              </h1>
              <div className="w-16 h-1 bg-[#d4a56a] mb-6 rounded-full"></div>
            </div>

            <div className="mt-8 relative z-10">
              <p className="text-[#e2cece] text-sm leading-relaxed mb-6">
                Pakistan's premier interactive marketplace for luxury wall paints, designer porcelain tiles, custom murals, and 3D architectural panels.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 bg-[#d4a56a] hover:bg-[#c29357] text-[#2c1a1a] px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/paint"
                  className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/30 px-5 py-3 rounded-full text-sm font-semibold transition-all"
                >
                  <Palette className="w-4 h-4 text-[#d4a56a]" />
                  <span>Paint Tool</span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Hero Photo with Floating Caption */}
          <div className="lg:col-span-8 relative min-h-[380px] lg:min-h-[520px] bg-[#3a1e1e]">
            <img
              src="/assets/images/hero.png"
              alt="Luxury Living Room Interior"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/hero_backup.png';
              }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
              <div className="max-w-2xl bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15">
                <div className="flex items-center gap-2 text-[#d4a56a] text-xs uppercase font-bold tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-Time Visualization Technology</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                  Transform Your Spaces with Interactive Designs
                </h2>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-4">
                  Experience colors and surface textures directly on your room walls prior to purchase. Hire vetted local craftspeople to install effortlessly.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    to="/room-designer"
                    className="inline-flex items-center gap-2 bg-white text-[#4b2c2c] hover:bg-[#d4a56a] hover:text-[#2c1a1a] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <span>Launch AI Room Designer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURE HIGHLIGHT STRIP
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f8ede3] text-[#7a4040] flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4b2c2c]">Virtual Visualizer</h4>
              <p className="text-xs text-gray-500">Live wall color & texture preview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f8ede3] text-[#7a4040] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4b2c2c]">Verified Providers</h4>
              <p className="text-xs text-gray-500">Certified local installers in Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f8ede3] text-[#7a4040] flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4b2c2c]">Safe Doorstep Delivery</h4>
              <p className="text-xs text-gray-500">Careful handling for fragile stone & rolls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f8ede3] text-[#7a4040] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4b2c2c]">Live Order Tracking</h4>
              <p className="text-xs text-gray-500">Real-time status updates anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MAGAZINE CATEGORIES GRID (EXACT 4 ASYMMETRIC TILES)
      ══════════════════════════════════════════════════ */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <span className="text-[#c17f4a] font-serif text-sm uppercase tracking-widest font-semibold block mb-2">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#4b2c2c] tracking-tight">
            Categories
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mt-2">
            Pick a category to begin transforming the atmosphere of your space.
          </p>
          <div className="w-12 h-1 bg-[#d4a56a] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CATEGORY 1: Paint */}
          <Link
            to="/paint"
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-500 border border-brand-border block"
          >
            <img
              src="/assets/images/paint-colors.png"
              alt="Wall Paint"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[#d4a56a] text-xs font-bold tracking-widest uppercase mb-1">
                01 · Paint
              </span>
              <h3 className="font-serif text-2xl font-bold leading-snug group-hover:text-[#d4a56a] transition-colors mb-3">
                Premium Wall Paints
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* CATEGORY 2: Tiles */}
          <Link
            to="/tiles"
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-500 border border-brand-border block"
          >
            <img
              src="/assets/images/Tiles.png"
              alt="Tiles"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[#d4a56a] text-xs font-bold tracking-widest uppercase mb-1">
                02 · Tiles
              </span>
              <h3 className="font-serif text-2xl font-bold leading-snug group-hover:text-[#d4a56a] transition-colors mb-3">
                Simple Tiles, <br />Stylish Look
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* CATEGORY 3: Wallpaper */}
          <Link
            to="/wallpaper"
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-500 border border-brand-border block"
          >
            <img
              src="/assets/images/wall wapaper.png"
              alt="Wallpaper"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[#d4a56a] text-xs font-bold tracking-widest uppercase mb-1">
                03 · Wallpaper
              </span>
              <h3 className="font-serif text-2xl font-bold leading-snug group-hover:text-[#d4a56a] transition-colors mb-3">
                Premium Quality <br />Wallpapers
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* CATEGORY 4: Wall Panels */}
          <Link
            to="/wallpenals"
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-500 border border-brand-border block"
          >
            <img
              src="/assets/images/wall penal.png"
              alt="Wall Panels"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[#d4a56a] text-xs font-bold tracking-widest uppercase mb-1">
                04 · Panelling
              </span>
              <h3 className="font-serif text-2xl font-bold leading-snug group-hover:text-[#d4a56a] transition-colors mb-3">
                Stylish Wall <br />Panels
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LATEST PRODUCTS SECTION
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#e6ded8]">
          <div>
            <span className="text-[#c17f4a] font-serif text-sm uppercase tracking-widest font-semibold block mb-1">
              Top Trending
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-[#4b2c2c]">
              Latest Products
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Fresh arrivals hand-picked to elevate modern Pakistani homes
            </p>
          </div>
          <Link
            to="/tiles"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a4040] hover:text-[#4b2c2c] mt-4 sm:mt-0 transition-colors"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border">
                <div className="h-44 rounded-xl animate-shimmer mb-4"></div>
                <div className="h-4 w-3/4 rounded animate-shimmer mb-2"></div>
                <div className="h-3 w-1/2 rounded animate-shimmer"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          AI ROOM DESIGNER CALLOUT BANNER
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#4b2c2c] via-[#5c3535] to-[#2c1a1a] p-8 sm:p-14 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-[#d4a56a]/20 text-[#d4a56a] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#d4a56a]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive 3D Studio</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Test Colors & Textures in Real Time Before You Buy
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Don't guess how paint or wallpapers will look in your bedroom or living lounge. Our interactive room designer lets you preview finishes under realistic lighting.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/paint"
                className="bg-[#d4a56a] hover:bg-[#c29357] text-[#2c1a1a] px-6 py-3 rounded-full text-sm font-bold transition-all shadow-md"
              >
                Try Paint Visualizer
              </Link>
              <Link
                to="/services"
                className="bg-transparent hover:bg-white/10 text-white border border-white/40 px-6 py-3 rounded-full text-sm font-semibold transition-all"
              >
                Find Local Installers
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const SUBCATEGORIES = ['All', 'Geometric', 'Floral', 'Abstract', 'Wood', 'Kids'];

export default function Wallpaper() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?category=Wallpaper';
    if (selectedSub !== 'All') {
      url += `&subCategory=${encodeURIComponent(selectedSub)}`;
    }
    if (search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let list = data.data;
          if (sortBy === 'price-low') {
            list = [...list].sort((a, b) => a.price - b.price);
          } else if (sortBy === 'price-high') {
            list = [...list].sort((a, b) => b.price - a.price);
          }
          setProducts(list);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSub, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#f7f4f0] pb-20">
      
      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-r from-[#4b2c2c] via-[#5e3434] to-[#2c1a1a] text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[#d4a56a] font-serif text-xs uppercase tracking-widest font-bold block mb-2">
            Artistic Wall Coverings
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-wider mb-3">
            DESIGNER WALLPAPERS
          </h1>
          <div className="w-16 h-1 bg-[#d4a56a] mx-auto mb-4 rounded-full"></div>
          <p className="text-sm text-gray-200 leading-relaxed max-w-xl mx-auto">
            From modern Scandinavian geometry and hand-painted florals to washable non-woven textures for statement feature walls.
          </p>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-md border border-brand-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSub(sub)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSub === sub
                    ? 'bg-[#4b2c2c] text-white shadow-xs'
                    : 'bg-[#faf8f5] text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <input
                type="text"
                placeholder="Search wallpapers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf8f5] text-xs py-2.5 pl-8 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#faf8f5] text-xs py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-[#4b2c2c]">{products.length}</strong> wallpaper designs
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-border">
                <div className="h-44 rounded-xl animate-shimmer mb-4"></div>
                <div className="h-4 w-3/4 rounded animate-shimmer mb-2"></div>
                <div className="h-3 w-1/2 rounded animate-shimmer"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8">
            <p className="text-gray-500 text-sm mb-4">No wallpapers found matching your selection.</p>
            <button
              onClick={() => { setSelectedSub('All'); setSearch(''); }}
              className="bg-[#4b2c2c] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#3a2020]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

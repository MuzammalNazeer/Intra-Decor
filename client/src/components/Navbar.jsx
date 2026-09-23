import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ onToggleMobileNav, isMobileNavOpen }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tiles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#4b2c2c] text-white shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LEFT: Logo & Search */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <img 
                src="/assets/images/logo.png" 
                alt="Intra Decor Logo" 
                className="h-12 w-auto object-contain rounded-md transition-transform group-hover:scale-105" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/uploads/logo.png';
                }}
              />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paint, tiles, wallpaper, panels..."
                className="w-full bg-[#3a2020] text-sm text-white placeholder-gray-300 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#d4a56a] border border-[#5d3838]"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#d4a56a]" />
            </form>
          </div>

          {/* RIGHT: User Actions & Cart */}
          <div className="flex items-center gap-5 sm:gap-6">
            
            {/* User Auth Links */}
            <div className="flex items-center gap-4 text-sm font-medium">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline-block text-[#d4a56a]">
                    Hi, {user.name?.split(' ')[0]}
                  </span>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-1.5 hover:text-[#d4a56a] transition-colors"
                    title="Account Dashboard"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">My Account</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 hover:text-[#ff8585] text-xs uppercase tracking-wider bg-[#3a2020] px-2.5 py-1.5 rounded transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="hover:text-[#d4a56a] transition-colors"
                  >
                    Login
                  </Link>
                  <span className="text-gray-400">/</span>
                  <Link 
                    to="/signup" 
                    className="text-[#d4a56a] hover:underline"
                  >
                    Signup
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="hidden sm:flex items-center gap-1 hover:text-[#d4a56a] transition-colors ml-1"
                  >
                    <User className="w-4 h-4" />
                    <span>My Account</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link 
              to="/cart" 
              className="relative flex items-center gap-2 bg-[#3a2020] hover:bg-[#5a3434] px-3.5 py-2 rounded-full border border-[#5d3838] transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-[#d4a56a]" />
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e74c3c] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              onClick={onToggleMobileNav} 
              className="md:hidden p-1.5 text-gray-200 hover:text-white rounded-md"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#3a2020] text-sm text-white placeholder-gray-400 rounded-full pl-9 pr-4 py-2 border border-[#5d3838]"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#d4a56a]" />
          </form>
        </div>

      </div>
    </header>
  );
}

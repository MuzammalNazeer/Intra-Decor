import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2c1a1a] text-gray-300 pt-16 pb-8 border-t-4 border-[#d4a56a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#442b2b]">
          
          {/* COLUMN 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/assets/images/logo.png" 
                alt="Intra Decor" 
                className="h-10 w-auto rounded bg-white/10 p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/uploads/logo.png';
                }}
              />
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                INTRA DECOR
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Transform your spaces with interactive design tools, premium architectural wall finishes, and verified local professionals across Pakistan.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <a href="#" className="w-9 h-9 rounded-full bg-[#3e2424] flex items-center justify-center hover:bg-[#d4a56a] hover:text-[#2c1a1a] transition-all">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#3e2424] flex items-center justify-center hover:bg-[#d4a56a] hover:text-[#2c1a1a] transition-all">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#3e2424] flex items-center justify-center hover:bg-[#d4a56a] hover:text-[#2c1a1a] transition-all">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#3e2424] flex items-center justify-center hover:bg-[#d4a56a] hover:text-[#2c1a1a] transition-all">
                <i className="fa-brands fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          {/* COLUMN 2: Explore Categories */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#d4a56a] mb-5 tracking-wide">
              Explore Collections
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/paint" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Wall Paints & Emulsion
                </Link>
              </li>
              <li>
                <Link to="/tiles" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Porcelain & Terrazzo Tiles
                </Link>
              </li>
              <li>
                <Link to="/wallpaper" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Luxury Textured Wallpapers
                </Link>
              </li>
              <li>
                <Link to="/wallpenals" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Acoustic & 3D Wall Panels
                </Link>
              </li>
              <li>
                <Link to="/paint" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Real-Time Paint Visualizer
                </Link>
              </li>
              <li>
                <Link to="/room-designer" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> AI Room Texture Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Customer Care & Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#d4a56a] mb-5 tracking-wide">
              Customer Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/services" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Find Local Service Providers
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Track Delivery Status
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> View Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> My Account Dashboard
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#d4a56a] transition-colors flex items-center gap-2">
                  <span className="text-[#d4a56a]">›</span> Become a Verified Installer
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Contact & Newsletter */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#d4a56a] mb-5 tracking-wide">
              Stay Connected
            </h3>
            <div className="space-y-3 text-sm text-gray-300 mb-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4a56a] flex-shrink-0 mt-1" />
                <span>Gulberg III & DHA Phase 5, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d4a56a] flex-shrink-0" />
                <span>+92 300 1234567 / +92 42 35789123</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d4a56a] flex-shrink-0" />
                <span>support@intradecorhome.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="relative">
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-950/40 p-2.5 rounded border border-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Subscribed! Check your inbox for decor deals.</span>
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#1e1111] text-xs text-white px-3 py-2.5 rounded-l border border-[#442b2b] focus:outline-none focus:border-[#d4a56a]"
                  />
                  <button
                    type="submit"
                    className="bg-[#d4a56a] hover:bg-[#c29357] text-[#2c1a1a] px-3.5 py-2.5 rounded-r font-semibold text-xs transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Intra Decor Home Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/tiles" className="hover:text-white">Shop</Link>
            <Link to="/services" className="hover:text-white">Services</Link>
            <Link to="/track-order" className="hover:text-white">Track Order</Link>
            <span className="text-[#d4a56a]">Built with React & Node.js</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

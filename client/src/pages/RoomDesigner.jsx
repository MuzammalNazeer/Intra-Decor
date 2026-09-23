import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Sparkles, Layers, Image as ImageIcon, Grid, ShoppingBag, Check, Sun, Sunset, Moon, MessageCircle } from 'lucide-react';

const TEXTURES = {
  wallpaper: [
    { id: 'w1', name: 'Abstract Wavy Luxe', image: '/assets/images/Abstract wallpaper.jpeg', category: 'Wallpaper', price: 4100 },
    { id: 'w2', name: 'Vintage Floral Botanical', image: '/assets/images/floral.jpeg', category: 'Wallpaper', price: 4500 },
    { id: 'w3', name: 'Nordic Minimalist Geometric', image: '/assets/images/Geomeric wallpaper.jpeg', category: 'Wallpaper', price: 3800 },
    { id: 'w4', name: 'Acoustic Wood Grain Slat', image: '/assets/images/wood wallpaper.jpeg', category: 'Wallpaper', price: 3600 }
  ],
  panels: [
    { id: 'p1', name: 'Natural Oak Fluted Slats', image: '/assets/images/wood wall penals.png', category: 'Wall Panelling', price: 8500 },
    { id: 'p2', name: '3D PVC Charcoal Interlock', image: '/assets/images/PVC wall  penals.jpeg', category: 'Wall Panelling', price: 4200 },
    { id: 'p3', name: 'Metallic Accent Facets', image: '/assets/images/Metal wall penals.png', category: 'Wall Panelling', price: 9800 },
    { id: 'p4', name: 'Classic White Wainscoting', image: '/assets/images/wainscoting wall penals.png', category: 'Wall Panelling', price: 6200 }
  ],
  tiles: [
    { id: 't1', name: 'Carrara White Marble', image: '/assets/images/merbal Tiles.jpeg', category: 'Tiles', price: 6800 },
    { id: 't2', name: 'Venetian Terrazzo Stone', image: '/assets/images/Terrazzo tiles.jpeg', category: 'Tiles', price: 5200 },
    { id: 't3', name: 'Spanish Travertine Beige', image: '/assets/images/Travertine.jpeg', category: 'Tiles', price: 5900 },
    { id: 't4', name: 'Rustic Natural Slate', image: '/assets/images/Slate.jpeg', category: 'Tiles', price: 4900 }
  ]
};

export default function RoomDesigner() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('wallpaper');
  const [selectedWallTexture, setSelectedWallTexture] = useState(TEXTURES.wallpaper[0]);
  const [selectedFloorTile, setSelectedFloorTile] = useState(TEXTURES.tiles[1]);
  const [lighting, setLighting] = useState('day');
  const [notification, setNotification] = useState('');

  const handleSelectTexture = (item) => {
    if (activeTab === 'tiles') {
      setSelectedFloorTile(item);
    } else {
      setSelectedWallTexture(item);
    }
  };

  const handleAddComboToCart = () => {
    addToCart({
      id: selectedWallTexture.id,
      name: selectedWallTexture.name,
      category: selectedWallTexture.category,
      price: selectedWallTexture.price,
      discount: 10,
      product_image: selectedWallTexture.image.split('/').pop()
    }, 2);

    addToCart({
      id: selectedFloorTile.id,
      name: selectedFloorTile.name,
      category: selectedFloorTile.category,
      price: selectedFloorTile.price,
      discount: 10,
      product_image: selectedFloorTile.image.split('/').pop()
    }, 4);

    setNotification('Design combo added to cart (Wall finish + Flooring)!');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleWhatsAppCombo = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Intra Decor!\n\nI created a custom room combo in your AI Room Designer:\n` +
      `• Wall Surface: ${selectedWallTexture.name} (${selectedWallTexture.category}) - Rs. ${selectedWallTexture.price.toLocaleString()}\n` +
      `• Floor Tiles: ${selectedFloorTile.name} (Tiles) - Rs. ${selectedFloorTile.price.toLocaleString()}\n\n` +
      `Please let me know if an installer can visit for on-site measurement.`
    );
    window.open(`https://wa.me/923008472910?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] pb-20">
      
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#2c1a1a] via-[#4b2c2c] to-[#3a1e1e] text-white py-10 px-4 text-center border-b border-[#5e3838]">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-[#d4a56a] text-xs font-bold uppercase tracking-widest mb-2 bg-[#d4a56a]/15 px-3 py-1 rounded-full border border-[#d4a56a]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Room Designer Studio</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white mb-3">
            Real-Time Texture & Surface Customizer
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Overlay luxury wallpapers, 3D acoustic panels, and imported floor tiles directly onto your room setting with dynamic lighting.
          </p>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="bg-white border-b border-brand-border py-3 px-4 shadow-xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          
          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Ambiance:</span>
            <button
              onClick={() => setLighting('day')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lighting === 'day' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Daylight</span>
            </button>
            <button
              onClick={() => setLighting('golden')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lighting === 'golden' ? 'bg-orange-100 text-orange-900 border border-orange-300 font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-orange-600" />
              <span>Golden Sunset</span>
            </button>
            <button
              onClick={() => setLighting('night')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lighting === 'night' ? 'bg-indigo-950 text-indigo-200 border border-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Night Lamps</span>
            </button>
          </div>

          <button
            onClick={handleWhatsAppCombo}
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Consult on WhatsApp</span>
          </button>

        </div>
      </div>

      {/* ── STUDIO LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 3D Room Canvas Overlay (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-brand-border bg-[#1a1412] aspect-[16/10]">
              
              <svg viewBox="0 0 1000 620" className="w-full h-full object-cover">
                <defs>
                  <pattern id="wallTexturePattern" patternUnits="userSpaceOnUse" width="220" height="220">
                    <image href={selectedWallTexture.image} x="0" y="0" width="220" height="220" preserveAspectRatio="xMidYMid slice" />
                  </pattern>

                  <pattern id="floorTilePattern" patternUnits="userSpaceOnUse" width="160" height="160">
                    <image href={selectedFloorTile.image} x="0" y="0" width="160" height="160" preserveAspectRatio="xMidYMid slice" />
                  </pattern>

                  <linearGradient id="wallShadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.05" />
                  </linearGradient>

                  <linearGradient id="floorPerspective" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* CEILING */}
                <polygon points="0,0 1000,0 820,110 180,110" fill="#f2ede6" />

                {/* FLOOR */}
                <polygon points="0,620 1000,620 820,490 180,490" fill="url(#floorTilePattern)" />
                <polygon points="0,620 1000,620 820,490 180,490" fill="url(#floorPerspective)" pointerEvents="none" />

                {/* LEFT WALL */}
                <polygon points="0,0 180,110 180,490 0,620" fill="url(#wallTexturePattern)" opacity="0.9" />
                <polygon points="0,0 180,110 180,490 0,620" fill="#000" opacity="0.18" pointerEvents="none" />

                {/* CENTER WALL */}
                <polygon points="180,110 820,110 820,490 180,490" fill="url(#wallTexturePattern)" />
                <polygon points="180,110 820,110 820,490 180,490" fill="url(#wallShadow)" pointerEvents="none" />

                {/* RIGHT WALL */}
                <polygon points="1000,0 820,110 820,490 1000,620" fill="url(#wallTexturePattern)" opacity="0.9" />
                <polygon points="1000,0 820,110 820,490 1000,620" fill="#000" opacity="0.22" pointerEvents="none" />

                {/* FURNITURE SILHOUETTES */}
                <rect x="340" y="420" width="320" height="85" rx="18" fill="#2d2825" opacity="0.95" />
                <rect x="365" y="380" width="270" height="55" rx="14" fill="#3a3430" opacity="0.95" />
                <rect x="380" y="390" width="40" height="40" rx="8" fill="#d4a56a" transform="rotate(-6 380 390)" />
                <rect x="580" y="390" width="40" height="40" rx="8" fill="#ffffff" opacity="0.9" transform="rotate(8 580 390)" />

                {/* Coffee Table */}
                <ellipse cx="500" cy="535" rx="85" ry="24" fill="#1b1716" opacity="0.85" />
                <line x1="450" y1="535" x2="450" y2="550" stroke="#d4a56a" strokeWidth="3" />
                <line x1="550" y1="535" x2="550" y2="550" stroke="#d4a56a" strokeWidth="3" />

                {/* Floor Vase */}
                <path d="M 230 470 Q 215 500 230 530 L 250 530 Q 265 500 250 470 Z" fill="#d4a56a" opacity="0.9" />
                <path d="M 240 470 L 225 360" stroke="#7a5538" strokeWidth="2.5" />
                <path d="M 240 470 L 255 350" stroke="#7a5538" strokeWidth="2.5" />
                <path d="M 240 470 L 240 330" stroke="#7a5538" strokeWidth="2.5" />

                {/* LIGHTING OVERLAYS */}
                {lighting === 'golden' && (
                  <rect width="1000" height="620" fill="#ffb347" opacity="0.18" pointerEvents="none" style={{ mixBlendMode: 'color-burn' }} />
                )}
                {lighting === 'night' && (
                  <rect width="1000" height="620" fill="#0d1117" opacity="0.45" pointerEvents="none" />
                )}
              </svg>

              {/* Status Badges on Preview */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <span className="text-[#d4a56a] font-bold">Wall:</span> {selectedWallTexture.name}
                </span>
                <span className="bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <span className="text-[#d4a56a] font-bold">Floor:</span> {selectedFloorTile.name}
                </span>
              </div>
            </div>

            {/* Notification alert */}
            {notification && (
              <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl font-medium flex items-center justify-between animate-fadeIn">
                <span>✓ {notification}</span>
              </div>
            )}
          </div>

          {/* RIGHT: Texture & Material Selector (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-brand-border shadow-md space-y-6">
            
            {/* Surface Category Tabs */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Select Decor Category
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon },
                  { id: 'panels', label: 'Panels', icon: Layers },
                  { id: 'tiles', label: 'Floor Tiles', icon: Grid },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'border-[#4b2c2c] bg-[#4b2c2c] text-white shadow-sm'
                          : 'border-gray-200 bg-[#faf8f5] text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Texture Swatches List */}
            <div>
              <span className="text-xs font-bold text-[#4b2c2c] uppercase tracking-wider block mb-3">
                Click to Apply to {activeTab === 'tiles' ? 'Flooring' : 'Walls'}:
              </span>

              <div className="space-y-3">
                {TEXTURES[activeTab].map((item) => {
                  const isCurrent = (activeTab === 'tiles' ? selectedFloorTile.id : selectedWallTexture.id) === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTexture(item)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-[#4b2c2c] bg-[#faf3ed] shadow-sm'
                          : 'border-gray-100 hover:border-[#d4a56a] bg-white'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-black/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-[#2c1a1a] truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-gray-500 block">{item.category}</span>
                        <span className="text-xs font-bold text-[#4b2c2c] mt-0.5 block">
                          Rs. {item.price.toLocaleString()}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full bg-[#4b2c2c] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <button
                onClick={handleAddComboToCart}
                className="w-full bg-[#d4a56a] hover:bg-[#c29357] text-[#2c1a1a] py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Complete Design to Cart</span>
              </button>

              <button
                onClick={handleWhatsAppCombo}
                className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Consult On-Site with Expert</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

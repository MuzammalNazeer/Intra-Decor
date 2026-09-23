import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Palette, Calculator, ShoppingBag, Download, RotateCcw, Check, Sparkles, Sun, Sunset, Moon, Upload, MessageCircle } from 'lucide-react';

const BRANDS = ['All Brands', 'Dulux', 'Berger', 'Nippon', 'Master'];

const COLOR_PALETTES = [
  // Whites & Neutrals
  { name: 'Alabaster White', hex: '#F4F1EA', shade: 'Light', brand: 'Dulux', category: 'Neutrals', price: 4200 },
  { name: 'Warm Greige', hex: '#D8CFC4', shade: 'Medium', brand: 'Dulux', category: 'Neutrals', price: 4300 },
  { name: 'Crisp Cotton', hex: '#FAF9F6', shade: 'Light', brand: 'Berger', category: 'Neutrals', price: 4100 },
  { name: 'Linen Canvas', hex: '#EAE5D9', shade: 'Light', brand: 'Master', category: 'Neutrals', price: 3800 },
  
  // Warm Earth & Terracotta
  { name: 'Terracotta Blush', hex: '#CB7C69', shade: 'Medium', brand: 'Berger', category: 'Earthy', price: 4400 },
  { name: 'Caramel Clay', hex: '#BA7A4C', shade: 'Medium', brand: 'Nippon', category: 'Earthy', price: 4600 },
  { name: 'Espresso Velvet', hex: '#4B2C2C', shade: 'Dark', brand: 'Dulux', category: 'Earthy', price: 4800 },
  { name: 'Golden Ochre', hex: '#D4A56A', shade: 'Medium', brand: 'Master', category: 'Earthy', price: 3900 },

  // Blues & Cool
  { name: 'Cloud Mist Blue', hex: '#DCE4EC', shade: 'Light', brand: 'Master', category: 'Blues', price: 3700 },
  { name: 'Nordic Indigo', hex: '#4A6984', shade: 'Medium', brand: 'Dulux', category: 'Blues', price: 4500 },
  { name: 'Midnight Navy', hex: '#1B2E4B', shade: 'Dark', brand: 'Berger', category: 'Blues', price: 4900 },
  { name: 'Slate Harbor', hex: '#5C6F84', shade: 'Medium', brand: 'Nippon', category: 'Blues', price: 4700 },

  // Greens & Sage
  { name: 'Vintage Sage', hex: '#9BB09E', shade: 'Medium', brand: 'Dulux', category: 'Greens', price: 4600 },
  { name: 'Eucalyptus Soft', hex: '#C2D1C5', shade: 'Light', brand: 'Master', category: 'Greens', price: 3800 },
  { name: 'Deep Forest', hex: '#2A4436', shade: 'Dark', brand: 'Berger', category: 'Greens', price: 4800 },
  { name: 'Olive Grove', hex: '#637053', shade: 'Medium', brand: 'Nippon', category: 'Greens', price: 4650 },

  // Grays & Dark Luxury
  { name: 'Silver Ash', hex: '#D5D8DC', shade: 'Light', brand: 'Dulux', category: 'Grays', price: 4200 },
  { name: 'Graphite Stone', hex: '#6E737B', shade: 'Medium', brand: 'Nippon', category: 'Grays', price: 4500 },
  { name: 'Charcoal Noir', hex: '#2B2E33', shade: 'Dark', brand: 'Master', category: 'Grays', price: 4100 },
  { name: 'Velvet Plum', hex: '#583648', shade: 'Dark', brand: 'Berger', category: 'Luxury', price: 4950 }
];

export default function PaintVisualizer() {
  const { addToCart } = useCart();
  
  // Studio View Mode: 'studio' vs 'upload'
  const [viewMode, setViewMode] = useState('studio');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [tintOpacity, setTintOpacity] = useState(0.45);

  // Selected wall target: 'left', 'center', 'right'
  const [activeWall, setActiveWall] = useState('center');

  // Lighting Simulation: 'day' | 'golden' | 'night'
  const [lighting, setLighting] = useState('day');

  // Wall colors state
  const [wallColors, setWallColors] = useState({
    left: '#D8CFC4',
    center: '#9BB09E',
    right: '#F4F1EA'
  });

  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeColor, setActiveColor] = useState(COLOR_PALETTES[12]); // Vintage Sage
  const [finishType, setFinishType] = useState('Matt Velvet');

  // Paint Calculator state
  const [wallWidth, setWallWidth] = useState(14);
  const [wallHeight, setWallHeight] = useState(10);
  const [openings, setOpenings] = useState(1);
  const [calcResult, setCalcResult] = useState({
    netArea: 119,
    litersNeeded: 2,
    estimatedCost: 2300
  });
  const [addedNotice, setAddedNotice] = useState(false);

  // Filter colors
  const filteredColors = COLOR_PALETTES.filter(c => {
    const matchesBrand = selectedBrand === 'All Brands' || c.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesBrand && matchesCategory;
  });

  const handleApplyColor = (color) => {
    setActiveColor(color);
    setWallColors(prev => ({
      ...prev,
      [activeWall]: color.hex
    }));
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    const grossArea = wallWidth * wallHeight;
    const netArea = Math.max(0, grossArea - (openings * 21));
    const litersNeeded = Math.ceil((netArea * 2) / 130);
    const estimatedCost = litersNeeded * (activeColor.price / 4);
    setCalcResult({
      netArea,
      litersNeeded: Math.max(1, litersNeeded),
      estimatedCost: Math.round(estimatedCost)
    });
  };

  const handleAddToCart = () => {
    const productItem = {
      id: `paint-${activeColor.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${activeColor.brand} ${activeColor.name} (${finishType})`,
      category: 'Paint',
      price: activeColor.price,
      discount: 10,
      product_image: 'paint-colors.png'
    };
    addToCart(productItem, calcResult ? Math.ceil(calcResult.litersNeeded / 4) || 1 : 1, {
      selectedColor: `${activeColor.name} (${activeColor.hex})`,
      finishType: finishType
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploadedImage(uploadEvent.target.result);
        setViewMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsAppQuote = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Intra Decor!\n\nI designed my room on your website:\n` +
      `• Paint: ${activeColor.brand} ${activeColor.name} (${activeColor.hex})\n` +
      `• Finish: ${finishType}\n` +
      `• Room Size: ${wallWidth} x ${wallHeight} ft (${calcResult?.netArea || 120} sq.ft)\n` +
      `• Required: ${calcResult?.litersNeeded || 2} Liters (~ Rs. ${(calcResult?.estimatedCost || 2300).toLocaleString()})\n\n` +
      `Please confirm stock availability and courier delivery to my city.`
    );
    window.open(`https://wa.me/923008472910?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setWallColors({
      left: '#EAE5D9',
      center: '#F4F1EA',
      right: '#EAE5D9'
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] pb-20">
      
      {/* ── TOP BANNER ── */}
      <div className="bg-gradient-to-r from-[#3a1e1e] via-[#4b2c2c] to-[#2c1a1a] text-white py-8 px-4 text-center border-b border-[#5e3838]">
        <div className="max-w-4xl mx-auto">
          <span className="text-[#d4a56a] text-xs font-serif font-bold uppercase tracking-widest block mb-1">
            Real-Time Color Simulator & Lighting Engine
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Paint Visualizer — Interior Hues
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Test wall colors under natural sunlight, warm golden hour, or evening lamps. Upload your own room photo or calculate exact paint liters.
          </p>
        </div>
      </div>

      {/* ── STUDIO CONTROLS TOOLBAR ── */}
      <div className="bg-white border-b border-brand-border py-3 px-4 shadow-xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          
          {/* Mode Switch: Preset Studio vs Upload Photo */}
          <div className="flex items-center gap-1.5 bg-[#faf8f5] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'studio' ? 'bg-[#4b2c2c] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Preset 3D Studio
            </button>
            <label className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'upload' ? 'bg-[#4b2c2c] text-white shadow-xs' : 'text-gray-600 hover:text-black'
            }`}>
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadedImage ? 'My Room Photo' : 'Upload My Room'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* 3-Way Lighting Mode Switch */}
          {viewMode === 'studio' && (
            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Lighting:</span>
              <button
                onClick={() => setLighting('day')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lighting === 'day' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Natural Daytime (Bright neutral daylight)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Daylight</span>
              </button>
              <button
                onClick={() => setLighting('golden')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lighting === 'golden' ? 'bg-orange-100 text-orange-900 border border-orange-300 font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Golden Hour Sunset (Warm amber glow)"
              >
                <Sunset className="w-3.5 h-3.5 text-orange-600" />
                <span>Golden Hour</span>
              </button>
              <button
                onClick={() => setLighting('night')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lighting === 'night' ? 'bg-indigo-950 text-indigo-200 border border-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Evening Lamps (Ambient cozy night lamps)"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Night Lamps</span>
              </button>
            </div>
          )}

          {/* Quick Action: WhatsApp Quote */}
          <button
            onClick={handleWhatsAppQuote}
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Instant Quote on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">WhatsApp Quote</span>
          </button>

        </div>
      </div>

      {/* ── MAIN STUDIO INTERFACE ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ══════════════════════════════════════════════════
              LEFT: INTERACTIVE CANVAS CONTAINER (8 Cols)
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Wall Selector Chips (Studio Mode) */}
            {viewMode === 'studio' ? (
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4b2c2c] uppercase tracking-wider mr-1">Active Wall:</span>
                  
                  <button
                    onClick={() => setActiveWall('left')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      activeWall === 'left'
                        ? 'bg-[#4b2c2c] text-white border-[#4b2c2c] shadow-xs'
                        : 'bg-[#faf8f5] text-gray-700 border-gray-200 hover:border-[#4b2c2c]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: wallColors.left }}></span>
                    <span>Left Wall</span>
                  </button>

                  <button
                    onClick={() => setActiveWall('center')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      activeWall === 'center'
                        ? 'bg-[#4b2c2c] text-white border-[#4b2c2c] shadow-xs'
                        : 'bg-[#faf8f5] text-gray-700 border-gray-200 hover:border-[#4b2c2c]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: wallColors.center }}></span>
                    <span>Center Wall</span>
                  </button>

                  <button
                    onClick={() => setActiveWall('right')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      activeWall === 'right'
                        ? 'bg-[#4b2c2c] text-white border-[#4b2c2c] shadow-xs'
                        : 'bg-[#faf8f5] text-gray-700 border-gray-200 hover:border-[#4b2c2c]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: wallColors.right }}></span>
                    <span>Accent Wall</span>
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-[#4b2c2c] flex items-center gap-1 font-medium transition-colors"
                  title="Reset to neutral white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs">
                <span className="text-xs font-bold text-[#4b2c2c]">Custom Photo Mode: Painting over uploaded wall photo</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Tint Intensity:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={tintOpacity}
                    onChange={(e) => setTintOpacity(Number(e.target.value))}
                    className="accent-[#4b2c2c] cursor-pointer w-28"
                  />
                </div>
              </div>
            )}

            {/* Room Visualizer Canvas Container */}
            <div className="relative bg-[#e8e2d9] rounded-3xl overflow-hidden border-2 border-brand-border shadow-md aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
              
              {viewMode === 'studio' ? (
                /* SVG 3D Perspective Room Layout with dynamic lighting & wall fills */
                <svg viewBox="0 0 1000 600" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="leftWallGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.02" />
                    </linearGradient>

                    <linearGradient id="ceilingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#d8d3cb" stopOpacity="0.95" />
                    </linearGradient>

                    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8d6547" />
                      <stop offset="100%" stopColor="#5c3f2b" />
                    </linearGradient>
                  </defs>

                  {/* CEILING */}
                  <polygon points="0,0 1000,0 800,120 200,120" fill="url(#ceilingGrad)" />

                  {/* FLOOR */}
                  <polygon points="0,600 1000,600 800,480 200,480" fill="url(#floorGrad)" />
                  <line x1="200" y1="480" x2="0" y2="600" stroke="#462f20" strokeWidth="2" />
                  <line x1="350" y1="480" x2="250" y2="600" stroke="#462f20" strokeWidth="1.5" opacity="0.6" />
                  <line x1="500" y1="480" x2="500" y2="600" stroke="#462f20" strokeWidth="1.5" opacity="0.6" />
                  <line x1="650" y1="480" x2="750" y2="600" stroke="#462f20" strokeWidth="1.5" opacity="0.6" />
                  <line x1="800" y1="480" x2="1000" y2="600" stroke="#462f20" strokeWidth="2" />

                  {/* LEFT WALL */}
                  <polygon
                    points="0,0 200,120 200,480 0,600"
                    fill={wallColors.left}
                    className="transition-colors duration-500 cursor-pointer"
                    onClick={() => setActiveWall('left')}
                  />
                  <polygon points="0,0 200,120 200,480 0,600" fill="url(#leftWallGrad)" pointerEvents="none" />

                  {/* CENTER WALL */}
                  <polygon
                    points="200,120 800,120 800,480 200,480"
                    fill={wallColors.center}
                    className="transition-colors duration-500 cursor-pointer"
                    onClick={() => setActiveWall('center')}
                  />
                  <radialGradient id="centerLight" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
                  </radialGradient>
                  <polygon points="200,120 800,120 800,480 200,480" fill="url(#centerLight)" pointerEvents="none" />

                  {/* RIGHT ACCENT WALL */}
                  <polygon
                    points="1000,0 800,120 800,480 1000,600"
                    fill={wallColors.right}
                    className="transition-colors duration-500 cursor-pointer"
                    onClick={() => setActiveWall('right')}
                  />
                  <polygon points="1000,0 800,120 800,480 1000,600" fill="url(#leftWallGrad)" transform="scale(-1, 1) translate(-1000, 0)" pointerEvents="none" />

                  {/* MODERN FURNITURE */}
                  <rect x="360" y="420" width="280" height="70" rx="14" fill="#2d2825" opacity="0.9" />
                  <rect x="380" y="380" width="240" height="50" rx="10" fill="#3a3430" opacity="0.9" />
                  <rect x="390" y="390" width="35" height="35" rx="6" fill="#d4a56a" transform="rotate(-8 390 390)" />
                  <rect x="575" y="390" width="35" height="35" rx="6" fill={wallColors.center} transform="rotate(10 575 390)" />

                  {/* Floor Lamp */}
                  <line x1="740" y1="280" x2="740" y2="490" stroke="#1f1b19" strokeWidth="4" />
                  <path d="M710 280 L770 280 L755 240 L725 240 Z" fill="#d4a56a" opacity="0.85" />
                  <ellipse cx="740" cy="490" rx="20" ry="6" fill="#1f1b19" />

                  {/* Minimalist Art Frame */}
                  <rect x="440" y="170" width="120" height="150" fill="#ffffff" stroke="#1f1b19" strokeWidth="6" rx="2" />
                  <rect x="455" y="185" width="90" height="120" fill="#f0ebe3" />
                  <circle cx="500" cy="235" r="28" fill="#4b2c2c" opacity="0.8" />
                  <line x1="470" y1="270" x2="530" y2="250" stroke="#d4a56a" strokeWidth="3" />

                  {/* ── LIGHTING SIMULATION OVERLAYS ── */}
                  {lighting === 'golden' && (
                    <polygon
                      points="0,0 1000,0 1000,600 0,600"
                      fill="#ffb347"
                      opacity="0.18"
                      pointerEvents="none"
                      style={{ mixBlendMode: 'color-burn' }}
                    />
                  )}
                  {lighting === 'night' && (
                    <g pointerEvents="none">
                      {/* Deep evening tint */}
                      <rect width="1000" height="600" fill="#0d1117" opacity="0.45" />
                      {/* Warm Lamp Glow Radial */}
                      <radialGradient id="lampGlow" cx="740" cy="280" r="220" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffe699" stopOpacity="0.55" />
                        <stop offset="50%" stopColor="#d4a56a" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </radialGradient>
                      <circle cx="740" cy="280" r="220" fill="url(#lampGlow)" style={{ mixBlendMode: 'screen' }} />
                    </g>
                  )}
                </svg>
              ) : (
                /* Custom Photo Upload Canvas */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  {uploadedImage ? (
                    <div className="relative w-full h-full">
                      <img src={uploadedImage} alt="Uploaded Room" className="w-full h-full object-contain" />
                      {/* Tint overlay with selected paint color */}
                      <div
                        className="absolute inset-0 transition-colors pointer-events-none"
                        style={{
                          backgroundColor: activeColor.hex,
                          opacity: tintOpacity,
                          mixBlendMode: 'multiply'
                        }}
                      ></div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-white">
                      <Upload className="w-12 h-12 mx-auto text-[#d4a56a] mb-2 animate-bounce" />
                      <p className="text-sm font-semibold">Upload a photo of your room to preview this paint shade</p>
                      <label className="mt-4 inline-block bg-[#d4a56a] text-[#2c1a1a] px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer hover:bg-[#c29357]">
                        Choose Image File
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Indicator Pill */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4a56a] animate-ping"></span>
                <span>
                  {viewMode === 'studio' ? `Editing: ${activeWall.toUpperCase()} WALL (${lighting.toUpperCase()})` : 'Custom Room Photo Preview'}
                </span>
              </div>
            </div>

            {/* CURATED COMBOS */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                Curated Harmonious Combos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Warm Cashmere', left: '#F4F1EA', center: '#D8CFC4', right: '#4B2C2C' },
                  { name: 'Nordic Forest', left: '#DCE4EC', center: '#9BB09E', right: '#2A4436' },
                  { name: 'Terracotta Sunset', left: '#FAF9F6', center: '#CB7C69', right: '#D4A56A' },
                  { name: 'Minimalist Slate', left: '#D5D8DC', center: '#6E737B', right: '#2B2E33' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setViewMode('studio');
                      setWallColors({ left: preset.left, center: preset.center, right: preset.right });
                    }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:border-[#4b2c2c] bg-[#faf8f5] hover:bg-white text-left transition-all group"
                  >
                    <div className="flex h-5 rounded-md overflow-hidden mb-2 shadow-xs">
                      <div className="flex-1" style={{ backgroundColor: preset.left }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.center }}></div>
                      <div className="flex-1" style={{ backgroundColor: preset.right }}></div>
                    </div>
                    <span className="text-xs font-semibold text-[#2c1a1a] block truncate group-hover:text-[#4b2c2c]">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT: PALETTE PICKER & CALCULATOR (4 Cols)
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Color Swatch Selector Panel */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-bold text-[#4b2c2c]">
                  Select Paint Color
                </h3>
              </div>

              {/* Brand Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                      selectedBrand === brand
                        ? 'bg-[#4b2c2c] text-white font-semibold'
                        : 'bg-[#faf8f5] text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              {/* Color Swatch Grid */}
              <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 pr-1">
                {filteredColors.map((color) => {
                  const isSelected = activeColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleApplyColor(color)}
                      className={`relative aspect-square rounded-xl transition-all p-1 flex items-end justify-start border-2 ${
                        isSelected
                          ? 'border-[#4b2c2c] scale-105 shadow-md ring-2 ring-[#d4a56a]'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.brand})`}
                    >
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-white/90 text-[#4b2c2c] flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Color Info Card */}
              <div className="mt-4 p-3.5 bg-[#faf8f5] rounded-xl border border-brand-border flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-black/15 shadow-xs flex-shrink-0"
                  style={{ backgroundColor: activeColor.hex }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-[#2c1a1a] truncate">
                      {activeColor.name}
                    </h4>
                    <span className="text-[10px] font-bold text-[#d4a56a] bg-[#4b2c2c] px-2 py-0.5 rounded">
                      {activeColor.brand}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{activeColor.hex} · {activeColor.shade} Shade</p>
                  <p className="text-xs font-bold text-[#4b2c2c] mt-0.5">Rs. {activeColor.price.toLocaleString()} / 4L Can</p>
                </div>
              </div>

              {/* Finish Selector */}
              <div className="mt-3">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Finish Type:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Matt Velvet', 'Silk Sheen', 'Gloss Shield'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFinishType(f)}
                      className={`py-1.5 rounded-lg border transition-all text-center ${
                        finishType === f
                          ? 'border-[#4b2c2c] bg-[#4b2c2c] text-white font-semibold'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════
                PAINT COVERAGE CALCULATOR
            ══════════════════════════════════════════════════ */}
            <div className="bg-[#fff8f2] p-5 rounded-2xl border-2 border-dashed border-[#c17f4a] shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-[#c17f4a]" />
                <h3 className="font-serif text-base font-bold text-[#4b2c2c]">
                  Paint Coverage Calculator
                </h3>
              </div>

              <form onSubmit={handleCalculate} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#8a6a5a] block mb-1">
                      Length (ft)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={wallWidth}
                      onChange={(e) => setWallWidth(Number(e.target.value))}
                      className="w-full bg-white text-xs p-2 rounded-lg border border-brand-border focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8a6a5a] block mb-1">
                      Height (ft)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={wallHeight}
                      onChange={(e) => setWallHeight(Number(e.target.value))}
                      className="w-full bg-white text-xs p-2 rounded-lg border border-brand-border focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8a6a5a] block mb-1">
                      Doors/Windows
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={openings}
                      onChange={(e) => setOpenings(Number(e.target.value))}
                      className="w-full bg-white text-xs p-2 rounded-lg border border-brand-border focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4b2c2c] hover:bg-[#3a2222] text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-xs"
                >
                  Recalculate Liters
                </button>
              </form>

              {calcResult && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-[#eedacf] text-xs space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Net Wall Surface Area:</span>
                    <strong className="text-[#4b2c2c]">{calcResult.netArea} sq.ft</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Paint Required (2 coats):</span>
                    <strong className="text-[#c17f4a] font-bold">{calcResult.litersNeeded} Liters</strong>
                  </div>
                  <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-100">
                    <span>Est. Paint Cost:</span>
                    <strong className="text-[#4b2c2c] font-bold text-sm">Rs. {calcResult.estimatedCost.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {/* Action Buttons: Add to Cart & WhatsApp */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#d4a56a] hover:bg-[#c29357] text-[#2c1a1a] text-sm font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Selected Paint to Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppQuote}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Get WhatsApp Official Quote</span>
                </button>
              </div>

              {addedNotice && (
                <div className="mt-2 text-center text-xs text-green-700 bg-green-100 py-1.5 rounded-lg font-medium animate-fadeIn">
                  ✓ Added to cart with {activeColor.name} & {finishType}!
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

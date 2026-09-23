import React, { useState } from 'react';
import { Calculator, X, Check, FileText, MessageCircle, Home, Sparkles, ArrowRight } from 'lucide-react';

export default function HouseEstimatorModal({ isOpen, onClose }) {
  const [houseSize, setHouseSize] = useState('5marla');
  const [bedrooms, setBedrooms] = useState(3);
  const [lounges, setLounges] = useState(1);
  const [bathrooms, setBathrooms] = useState(3);
  const [qualityGrade, setQualityGrade] = useState('luxury'); // 'standard' | 'luxury'

  if (!isOpen) return null;

  // Preset configuration
  const handlePreset = (type) => {
    setHouseSize(type);
    if (type === '5marla') {
      setBedrooms(3);
      setLounges(1);
      setBathrooms(3);
    } else if (type === '10marla') {
      setBedrooms(4);
      setLounges(2);
      setBathrooms(4);
    } else if (type === '1kanal') {
      setBedrooms(5);
      setLounges(3);
      setBathrooms(6);
    }
  };

  // Calculations
  // Avg bedroom: 14x12x10 = 520 sqft wall, 168 sqft floor
  // Avg lounge: 20x15x10 = 700 sqft wall, 300 sqft floor
  // Avg bath: 8x6x10 = 280 sqft wall tile, 48 sqft floor
  const totalWallPaintSqft = (bedrooms * 520) + (lounges * 700);
  const totalFloorTileSqft = (bedrooms * 168) + (lounges * 300) + (bathrooms * 48);
  const totalBathTileSqft = bathrooms * 280;

  // Paint liters (1L covers 65 sqft for 2 coats)
  const paintLiters = Math.ceil(totalWallPaintSqft / 65);
  const paintBuckets = Math.ceil(paintLiters / 16); // 16L Master drum

  // Tile boxes (15.5 sqft per box)
  const tileBoxes = Math.ceil((totalFloorTileSqft + totalBathTileSqft) / 15.5);

  // Costings
  const ratePerLiter = qualityGrade === 'luxury' ? 1200 : 900;
  const ratePerTileBox = qualityGrade === 'luxury' ? 5800 : 4200;
  const paintMaterialCost = paintLiters * ratePerLiter;
  const tileMaterialCost = tileBoxes * ratePerTileBox;

  // Labor
  const paintLabor = totalWallPaintSqft * 22; // Rs. 22 / sqft
  const tileLabor = (totalFloorTileSqft + totalBathTileSqft) * 40; // Rs. 40 / sqft
  const totalLaborCost = paintLabor + tileLabor;

  const grandTotal = paintMaterialCost + tileMaterialCost + totalLaborCost;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Intra Decor!\n\nI generated a Whole-House Project Estimate on your website:\n` +
      `• Home Configuration: ${bedrooms} Beds, ${lounges} Lounges, ${bathrooms} Baths (${qualityGrade.toUpperCase()} Finish)\n` +
      `• Paint Material: ~${paintLiters} Liters (Rs. ${paintMaterialCost.toLocaleString()})\n` +
      `• Tiles Material: ~${tileBoxes} Boxes (Rs. ${tileMaterialCost.toLocaleString()})\n` +
      `• Installer Labor: Rs. ${totalLaborCost.toLocaleString()}\n` +
      `• Total Estimated Budget: Rs. ${grandTotal.toLocaleString()}\n\n` +
      `Please connect me with a project consultant for on-site verification.`
    );
    window.open(`https://wa.me/923008472910?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-brand-border relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-bold text-[#d4a56a] uppercase tracking-widest block mb-1">
            Turnkey Interior Budgeting
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#4b2c2c] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#d4a56a]" />
            <span>Whole-House Decor Cost Estimator</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Calculate accurate quantities of paint, tiles, and installer labor based on standard Pakistani architectural layouts.
          </p>
        </div>

        {/* Home Size Preset Buttons */}
        <div className="mb-5">
          <label className="text-xs font-bold text-gray-700 block mb-2">Select Plot / House Preset:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '5marla', label: '5 Marla (Standard)' },
              { id: '10marla', label: '10 Marla (Double Story)' },
              { id: '1kanal', label: '1 Kanal (Luxury Villa)' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  houseSize === p.id
                    ? 'border-[#4b2c2c] bg-[#4b2c2c] text-white shadow-xs'
                    : 'border-gray-200 bg-[#faf8f5] text-gray-700 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room Counters */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-4 bg-[#faf8f5] rounded-2xl border border-gray-100">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Bedrooms</label>
            <input
              type="number"
              min="1"
              max="10"
              value={bedrooms}
              onChange={(e) => setBedrooms(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white text-xs p-2 rounded-xl border border-gray-200 text-center font-bold text-[#4b2c2c]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Living Lounges</label>
            <input
              type="number"
              min="1"
              max="6"
              value={lounges}
              onChange={(e) => setLounges(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white text-xs p-2 rounded-xl border border-gray-200 text-center font-bold text-[#4b2c2c]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Bathrooms</label>
            <input
              type="number"
              min="1"
              max="10"
              value={bathrooms}
              onChange={(e) => setBathrooms(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white text-xs p-2 rounded-xl border border-gray-200 text-center font-bold text-[#4b2c2c]"
            />
          </div>
        </div>

        {/* Quality Level Selector */}
        <div className="mb-6 flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
          <span className="text-xs font-bold text-gray-700">Specification Grade:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setQualityGrade('standard')}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                qualityGrade === 'standard' ? 'bg-[#4b2c2c] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Master Standard
            </button>
            <button
              onClick={() => setQualityGrade('luxury')}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                qualityGrade === 'luxury' ? 'bg-[#d4a56a] text-[#2c1a1a] font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dulux Velvet Luxury
            </button>
          </div>
        </div>

        {/* Breakdown Summary Box */}
        <div className="bg-[#fff8f2] rounded-2xl p-5 border-2 border-dashed border-[#c17f4a] space-y-3 mb-6">
          <h4 className="font-serif text-sm font-bold text-[#4b2c2c] border-b border-[#eedacf] pb-2">
            Estimated Material & Labor Breakdown
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Paint Materials</span>
              <strong className="text-sm text-[#4b2c2c] block mt-0.5">{paintLiters} Liters</strong>
              <span className="text-[11px] text-gray-500">~{paintBuckets} Large Drums</span>
              <span className="text-xs font-bold text-[#7a4040] block mt-1">Rs. {paintMaterialCost.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Porcelain Tiles</span>
              <strong className="text-sm text-[#4b2c2c] block mt-0.5">{tileBoxes} Boxes</strong>
              <span className="text-[11px] text-gray-500">~{(totalFloorTileSqft + totalBathTileSqft)} sq.ft</span>
              <span className="text-xs font-bold text-[#7a4040] block mt-1">Rs. {tileMaterialCost.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Installer Labor</span>
              <strong className="text-sm text-[#4b2c2c] block mt-0.5">Verified Pros</strong>
              <span className="text-[11px] text-gray-500">Paint & Tile Fixing</span>
              <span className="text-xs font-bold text-[#7a4040] block mt-1">Rs. {totalLaborCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#eedacf] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Estimated Turnkey Budget</span>
              <span className="font-serif text-2xl font-extrabold text-[#4b2c2c]">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
              Materials + Labor Included
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#1ebd5b] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send Estimate to WhatsApp Consultant</span>
          </button>
          <button
            onClick={onClose}
            className="sm:w-32 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

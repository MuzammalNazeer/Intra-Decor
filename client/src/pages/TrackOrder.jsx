import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, Truck, Package, MapPin } from 'lucide-react';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (searchVal) => {
    const q = (searchVal || query).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No matching order found');
      setOrder(data.data);
    } catch (err) {
      setOrder(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleTrack(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-12 sm:py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <span className="text-[#d4a56a] font-serif text-xs font-bold uppercase tracking-widest block mb-1">
            Real-Time Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#4b2c2c] mb-2">
            Track Your Order
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Enter your Order ID (e.g. ORD-94821), Tracking Code, or contact phone number.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
          className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-brand-border flex items-center gap-2 mb-8 max-w-xl mx-auto"
        >
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ORD-94821 or 03219876543"
            className="flex-1 bg-[#faf8f5] text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#4b2c2c] hover:bg-[#3a2020] text-white px-5 sm:px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 flex-shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Locating...' : 'Track'}</span>
          </button>
        </form>

        {error && (
          <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl text-center font-medium mb-8">
            {error}
          </div>
        )}

        {/* Order Details & Timeline Display */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-md space-y-8 animate-fadeIn">
            
            {/* Top Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Order Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4b2c2c]">
                    {order.status}
                  </h3>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-gray-500 block">Tracking: <strong className="text-gray-900 font-mono">{order.trackingNumber}</strong></span>
                <span className="text-xs text-gray-500 block">Placed On: <strong className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Visual Timeline Milestones */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                Delivery Progression Milestones
              </h4>
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {(order.timeline || []).map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step.done
                          ? 'bg-[#4b2c2c] text-white border-[#4b2c2c] ring-4 ring-[#4b2c2c]/10'
                          : 'bg-white text-gray-400 border-gray-300'
                      }`}
                    >
                      {step.done ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-xs sm:text-sm font-bold ${step.done ? 'text-[#2c1a1a]' : 'text-gray-400'}`}>
                        {step.title}
                      </h5>
                      <span className="text-[11px] text-gray-400">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination & Items Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100 text-xs">
              <div className="p-4 bg-[#faf8f5] rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-[#4b2c2c] block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d4a56a]" /> Shipping Address
                </span>
                <p className="text-gray-800 font-semibold">{order.customerName}</p>
                <p className="text-gray-600">{order.address}</p>
                <p className="text-gray-600">{order.city}, Pakistan</p>
                <p className="text-gray-600 font-mono mt-1">{order.phone}</p>
              </div>

              <div className="p-4 bg-[#faf8f5] rounded-2xl border border-gray-100 space-y-2">
                <span className="font-bold text-[#4b2c2c] block mb-1 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#d4a56a]" /> Items in Parcel ({order.items?.length})
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {(order.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between text-gray-700">
                      <span className="truncate flex-1 pr-2">{it.name} (x{it.quantity})</span>
                      <strong className="text-[#4b2c2c]">Rs. {it.total?.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[#4b2c2c] text-sm">
                  <span>Grand Total:</span>
                  <span>Rs. {order.grandTotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

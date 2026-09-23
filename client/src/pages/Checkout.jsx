import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Banknote, Lock, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const { cartItems, subtotal, shipping, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Lahore',
    paymentMethod: 'Cash on Delivery',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        userId: user?.id || 'guest',
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.finalPrice,
          total: item.finalPrice * item.quantity,
          selectedColor: item.selectedColor,
          image: item.image
        })),
        subtotal,
        shipping,
        grandTotal
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      clearCart();
      navigate('/order-success', { state: { order: data.data } });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-10 sm:py-14 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="pb-6 mb-8 border-b border-gray-200">
          <h1 className="font-serif text-3xl font-extrabold text-[#4b2c2c]">
            Secure Checkout
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete your order delivery information and select payment preference
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Delivery & Payment Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Contact & Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#4b2c2c] pb-3 border-b border-gray-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#d4a56a]" />
                <span>1. Shipping & Contact Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ahmed"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number (For Courier SMS) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ahmed@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Destination City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
                  >
                    {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Peshawar', 'Quetta', 'Sheikhupura', 'Farooqabad'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Street Address, House/Flat & Sector *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. House 42, Street 8, Block Y, Phase 3, DHA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                ></textarea>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#4b2c2c] pb-3 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d4a56a]" />
                <span>2. Payment Preference</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'border-[#4b2c2c] bg-[#faf3ed]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-[#4b2c2c]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#4b2c2c]" />
                      <span className="text-xs font-bold text-[#2c1a1a]">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Pay in cash when delivery rider arrives</p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'Card'
                      ? 'border-[#4b2c2c] bg-[#faf3ed]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    checked={formData.paymentMethod === 'Card'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-[#4b2c2c]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#4b2c2c]" />
                      <span className="text-xs font-bold text-[#2c1a1a]">Debit / Credit Card</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Instant online payment via Safepay</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT: Order Review (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4b2c2c] pb-3 border-b border-gray-100">
              Order Review
            </h3>

            {/* Mini Items List */}
            <div className="max-h-48 overflow-y-auto space-y-3 pr-1 text-xs">
              {cartItems.map((item) => (
                <div key={item.cartKey} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 truncate block">{item.name}</span>
                    <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#4b2c2c]">
                    Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-[#4b2c2c]">
                <span>Grand Total:</span>
                <span className="font-serif text-xl">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#d4a56a]" />
              <span>{isSubmitting ? 'Placing Order...' : 'Place Confirmed Order'}</span>
            </button>

            <div className="pt-2 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Encrypted 256-bit Secure Transaction</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

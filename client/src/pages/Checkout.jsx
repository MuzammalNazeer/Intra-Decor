import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Banknote, Lock, ArrowRight, ShoppingBag } from 'lucide-react';

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
    paymentMethod: 'Safepay',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center border border-brand-border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#faf0ea] text-[#4b2c2c] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4b2c2c] mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            There are currently no items in your cart to checkout. Please add products from the store first.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/tiles"
              className="inline-flex items-center justify-center gap-2 bg-[#4b2c2c] hover:bg-[#3a2020] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Explore Tiles</span>
              <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
            </Link>
            <Link
              to="/wallpaper"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Wallpapers</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('intradecor_token');

      if (formData.paymentMethod === 'Safepay') {
        const payload = {
          name: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          items: cartItems,
          grandTotal: grandTotal,
          subtotal: subtotal,
          shipping: shipping,
        };

        const res = await fetch('/api/payments/safepay/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create Safepay session');

        const tracker = data.data?.tracker || data.tracker;
        if (!tracker) throw new Error('Safepay session did not return a tracker');

        // Check if an external hosted checkout link was provided (production Safepay)
        const checkoutUrl = data.data?.checkoutUrl;
        if (checkoutUrl && checkoutUrl.includes('getsafepay.com')) {
          window.location.href = checkoutUrl;
          return;
        }

        navigate(`/payment/safepay?tracker=${encodeURIComponent(tracker)}`);
        return;
      }

      // Cash on Delivery (COD)
      const payload = {
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        payment_method: 'cod',
        items: cartItems,
        grandTotal: grandTotal,
        subtotal: subtotal,
        shipping: shipping,
      };

      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      const order = data.data || data.order || {
        id: data.orderId || data.id,
        trackingNumber: data.trackingNumber || `INTRA-${Date.now()}`,
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        paymentMethod: 'Cash on Delivery',
        grandTotal: grandTotal,
        orders: data.orders || []
      };

      clearCart();
      navigate('/order-success', { state: { order } });
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
                    placeholder="e.g. 0347 9814741"
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
                    placeholder="e.g. info.muzseo@gmail.com"
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
                  placeholder="e.g. House 42, Block G, Phase 2, Johar Town, Lahore"
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
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'border-[#4b2c2c] bg-[#faf3ed] shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-[#4b2c2c] mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#4b2c2c]" />
                        <span className="text-xs font-bold text-[#2c1a1a]">Cash on Delivery</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">COD</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Pay with physical cash when rider delivers to your doorstep</p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'Safepay'
                      ? 'border-[#4b2c2c] bg-[#faf3ed] shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Safepay"
                    checked={formData.paymentMethod === 'Safepay'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-[#4b2c2c] mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#4b2c2c]" />
                        <span className="text-xs font-bold text-[#2c1a1a]">Safepay Payment</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Online</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Visa, Mastercard, PayPak, or Mobile Wallet through Safepay</p>
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
              <span>
                {isSubmitting
                  ? (formData.paymentMethod === 'Safepay' ? 'Connecting to Safepay...' : 'Placing COD Order...')
                  : (formData.paymentMethod === 'Safepay' ? `Proceed to Safepay (Rs. ${grandTotal.toLocaleString()})` : `Place COD Order (Rs. ${grandTotal.toLocaleString()})`)}
              </span>
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

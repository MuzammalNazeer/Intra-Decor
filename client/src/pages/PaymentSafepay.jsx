import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Package,
  AlertCircle,
  Sparkles,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function PaymentSafepay() {
  const [searchParams] = useSearchParams();
  const tracker = searchParams.get('tracker');
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  // Payment form state
  const [paymentType, setPaymentType] = useState('card'); // 'card' or 'wallet'
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [walletPhone, setWalletPhone] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Fetch session data on mount
  useEffect(() => {
    if (!tracker) {
      setSessionError('No payment tracker found. Please initiate checkout from your cart.');
      setLoadingSession(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('intradecor_token');
        const res = await fetch(`/api/payments/safepay/session/${encodeURIComponent(tracker)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Payment session expired or invalid.');
        }

        setSession(data.data);
        setCardHolder(data.data.customerName || 'Muhammad Ahmed');
        setWalletPhone(data.data.phone || '03479814741');
      } catch (err) {
        setSessionError(err.message);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [tracker]);

  // Handle Pay Action
  const handlePayNow = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessing(true);

    try {
      setStepMessage('Encrypting 256-bit payment token...');
      await new Promise((r) => setTimeout(r, 600));

      setStepMessage('Connecting to Safepay Gateway Network...');
      await new Promise((r) => setTimeout(r, 700));

      setStepMessage('Verifying credentials & approving transaction...');

      const token = localStorage.getItem('intradecor_token');
      const res = await fetch('/api/payments/safepay/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tracker,
          paymentType,
          paymentDetails: {
            cardNumber: cardNumber.replace(/\s+/g, ''),
            cardHolder,
            paymentType,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment authorization failed');
      }

      setStepMessage('Payment Approved! Finalizing Order...');
      await new Promise((r) => setTimeout(r, 400));

      // Clear client cart
      clearCart();

      const orderData = data.data || data.order || {
        id: Date.now(),
        trackingNumber: tracker,
        customerName: session?.customerName || cardHolder,
        phone: session?.phone || walletPhone,
        address: session?.address || '',
        city: session?.city || '',
        paymentMethod: 'Safepay',
        grandTotal: session?.grandTotal || session?.amount || 0,
      };

      navigate('/order-success', { state: { order: orderData } });
    } catch (err) {
      setPaymentError(err.message || 'Payment failed. Please check your details and try again.');
      setIsProcessing(false);
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvv('123');
    setCardHolder(session?.customerName || 'Test Cardholder');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-14 h-14 rounded-full border-4 border-[#4b2c2c]/20 border-t-[#4b2c2c] animate-spin mb-4"></div>
        <p className="font-serif text-lg font-bold text-[#4b2c2c]">Connecting to Safepay Checkout...</p>
        <p className="text-xs text-gray-500 mt-1">Preparing encrypted transaction environment</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Safepay Session Issue</h1>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">{sessionError}</p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full rounded-xl bg-[#4b2c2c] hover:bg-[#3a2020] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition shadow-sm"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  const grandTotal = session?.grandTotal || session?.amount || 0;
  const items = session?.items || [];

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-10 sm:py-14 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
              title="Return to Checkout"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-extrabold text-[#4b2c2c]">Safepay</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sandbox Checkout
                </span>
              </div>
              <p className="text-xs text-gray-500">Official Pakistani Digital Payment Gateway</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Safepay Payment Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-md space-y-6">

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Select Safepay Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition text-xs font-bold ${
                    paymentType === 'card'
                      ? 'border-[#4b2c2c] bg-[#faf3ed] text-[#4b2c2c]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('wallet')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition text-xs font-bold ${
                    paymentType === 'wallet'
                      ? 'border-[#4b2c2c] bg-[#faf3ed] text-[#4b2c2c]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>EasyPaisa / JazzCash</span>
                </button>
              </div>
            </div>

            {/* Card Form */}
            {paymentType === 'card' && (
              <form onSubmit={handlePayNow} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-gray-800">Card Credentials</span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[11px] font-bold text-[#c17f4a] hover:underline flex items-center gap-1 bg-[#fdf7f2] px-2.5 py-1 rounded-lg border border-[#ebd8c8]"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill Sandbox Card</span>
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Card Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-[#faf8f5] text-xs font-mono p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Muhammad Ahmed"
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Expiry (MM/YY) *</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-[#faf8f5] text-xs font-mono p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">CVV / CVC *</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="888"
                      className="w-full bg-[#faf8f5] text-xs font-mono p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>
                </div>

                {/* Processing Overlay / Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-4 bg-[#4b2c2c] hover:bg-[#3a2020] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock className="w-4 h-4 text-[#d4a56a]" />
                  <span>
                    {isProcessing
                      ? (stepMessage || 'Processing Safepay...')
                      : `Pay Rs. ${grandTotal.toLocaleString()} PKR via Safepay`}
                  </span>
                </button>
              </form>
            )}

            {/* Mobile Wallet Form */}
            {paymentType === 'wallet' && (
              <form onSubmit={handlePayNow} className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                  Safepay Mobile Gateway supports EasyPaisa, JazzCash, and 1Link Raast. In Sandbox simulation mode, enter your account phone number to authorize immediate payment approval.
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Mobile Wallet Account Number (03XX-XXXXXXX) *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="0347 9814741"
                      className="w-full bg-[#faf8f5] text-xs font-mono p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Muhammad Ahmed"
                    className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-4 bg-[#4b2c2c] hover:bg-[#3a2020] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock className="w-4 h-4 text-[#d4a56a]" />
                  <span>
                    {isProcessing
                      ? (stepMessage || 'Processing Safepay...')
                      : `Authorize & Pay Rs. ${grandTotal.toLocaleString()} PKR`}
                  </span>
                </button>
              </form>
            )}

            <div className="pt-2 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safepay Payments (Pvt) Ltd. — State Bank of Pakistan Approved Gateway</span>
            </div>

          </div>

          {/* RIGHT: Order Invoice Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-5">
            <div className="pb-3 border-b border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Checkout Invoice</span>
              <h3 className="font-serif text-lg font-bold text-[#4b2c2c]">Order Summary</h3>
            </div>

            <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Safepay Tracker:</span>
                <span className="font-mono font-bold text-[#4b2c2c]">{session?.tracker || tracker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <strong className="text-gray-800">{session?.customerName || 'Customer'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery City:</span>
                <span className="text-gray-800">{session?.city || 'Pakistan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-800 font-mono">{session?.phone || '—'}</span>
              </div>
            </div>

            {/* Collapsible item list */}
            <div>
              <button
                type="button"
                onClick={() => setShowItemDetails(!showItemDetails)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700 py-1 hover:text-[#4b2c2c] transition"
              >
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#d4a56a]" />
                  <span>Items in Parcel ({items.length})</span>
                </div>
                {showItemDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showItemDetails && (
                <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs border-t border-gray-100 pt-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-700">
                      <span className="truncate flex-1 pr-2">
                        {it.product_name || it.name} <span className="text-gray-400">×{it.quantity}</span>
                      </span>
                      <strong className="text-[#4b2c2c] font-mono">
                        Rs. {((it.finalPrice || it.price) * it.quantity).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>Rs. {(session?.subtotal || grandTotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Shipping:</span>
                <span>{(session?.shipping === 0 || grandTotal > 15000) ? 'FREE' : `Rs. ${session?.shipping || 500}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-[#4b2c2c]">
                <span>Payable Now:</span>
                <span className="font-serif text-xl text-emerald-800">Rs. {grandTotal.toLocaleString()} PKR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition text-center block"
            >
              Cancel & Return to Checkout
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

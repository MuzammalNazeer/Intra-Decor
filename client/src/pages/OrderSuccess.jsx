import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Phone } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-14 px-4 pb-24">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-md text-center">
        
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[#d4a56a] font-serif text-xs font-bold uppercase tracking-widest block mb-1">
          Thank you for choosing Intra Decor
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-[#4b2c2c] mb-2">
          Order Successfully Placed!
        </h1>
        <p className="text-xs text-gray-500 mb-8 max-w-md mx-auto">
          We have received your decor order. A confirmation SMS and courier tracking update will be dispatched to {order.phone}.
        </p>

        {/* Invoice Summary Card */}
        <div className="bg-[#faf8f5] rounded-2xl p-6 border border-brand-border text-left mb-8 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Order Identifier</span>
              <strong className="text-base text-[#4b2c2c] font-mono">{order.id}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Tracking Code</span>
              <strong className="text-base text-[#c17f4a] font-mono">{order.trackingNumber}</strong>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span>Customer Name:</span>
              <strong className="text-gray-900">{order.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="text-gray-900">{order.address}, {order.city}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <strong className="text-gray-900">{order.paymentMethod}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-[#4b2c2c]">
              <span>Total Paid / Payable:</span>
              <span>Rs. {order.grandTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/track-order?query=${encodeURIComponent(order.id)}`}
            className="w-full sm:w-auto bg-[#4b2c2c] hover:bg-[#3a2020] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-[#d4a56a]" />
            <span>Track Order Status</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-full text-xs font-semibold transition-all"
          >
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}

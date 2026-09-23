import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, shipping, grandTotal, totalSavings } = useCart();

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
            Looks like you haven't added any luxury paints, tiles, or wall panels to your cart yet.
          </p>
          <Link
            to="/tiles"
            className="inline-flex items-center gap-2 bg-[#4b2c2c] hover:bg-[#3a2020] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-10 sm:py-14 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-[#4b2c2c]">
              Shopping Cart
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your decor items and quantities before checkout
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartKey}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={`/uploads/${item.image}`}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-black/10 bg-[#faf8f5] flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/assets/images/${item.image || 'logo.png'}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#7a4040] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#2c1a1a] truncate">
                      {item.name}
                    </h3>
                    {item.selectedColor && (
                      <span className="inline-block text-xs text-gray-500 mt-0.5">
                        Color: <strong className="text-gray-700">{item.selectedColor}</strong>
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Unit Price: <span className="font-bold text-[#4b2c2c]">Rs. {item.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-[#faf8f5] p-1">
                    <button
                      onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 text-gray-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#4b2c2c]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 text-gray-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-[#4b2c2c] block">
                      Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/tiles"
                className="text-xs font-bold text-[#4b2c2c] hover:underline flex items-center gap-1"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4b2c2c] pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items):</span>
                <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Special Discount Savings:</span>
                  <span>- Rs. {totalSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Doorstep Freight:</span>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : `Rs. ${shipping}`}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-bold text-[#4b2c2c]">
                <span>Total Amount:</span>
                <span className="font-serif text-xl">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95 block text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
            </Link>

            <div className="pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#d4a56a]" />
                <span>Free shipping on orders above Rs. 15,000</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4a56a]" />
                <span>Cash on delivery or secure card payment</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

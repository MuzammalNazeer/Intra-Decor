import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus, ArrowLeft, Heart, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFav = isInWishlist(id);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ userName: user?.name || '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNewReview(prev => ({ ...prev, userName: prev.userName || user.name }));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    fetch(`/api/products/${id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          navigate('/tiles', { replace: true });
          return;
        }

        setProduct(data.data);
        if (data.data.colors && data.data.colors.length > 0) {
          setSelectedColor(data.data.colors[0]);
        }

        fetch(`/api/products?category=${encodeURIComponent(data.data.category)}`)
          .then(r => r.json())
          .then(relData => {
            if (relData.success) {
              setRelated(relData.data.filter(p => p.id !== id).slice(0, 4));
            }
          });
      })
      .catch(err => {
        console.error(err);
        navigate('/tiles', { replace: true });
      })
      .finally(() => setLoading(false));

    fetch(`/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setReviews(data.data);
      })
      .catch(() => {});
  }, [id, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newReview)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReviews(prev => [data.data, ...prev]);
        setNewReview({ userName: user?.name || '', rating: 5, comment: '' });
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] py-16 px-4">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl animate-shimmer h-96"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#4b2c2c] mb-4">Product Not Found</h2>
        <Link to="/tiles" className="bg-[#4b2c2c] text-white px-5 py-2.5 rounded-full text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = Math.round(price - (price * discount / 100));

  const imageSrc = product.product_image?.startsWith('http')
    ? product.product_image
    : product.product_image
      ? `/uploads/${product.product_image}`
      : '/assets/images/logo.png';

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      selectedColor: selectedColor ? `${selectedColor.name} (${selectedColor.hex})` : null
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-8 sm:py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#4b2c2c]">Home</Link>
          <span>/</span>
          <Link to={`/${product.category.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-[#4b2c2c]">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#4b2c2c] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: Product Image (5 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#faf8f5] border border-gray-100 relative group">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/assets/images/${product.product_image || 'Tiles.png'}`;
                  }}
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-[#e74c3c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT: Product Specs & Ordering (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="text-[#7a4040] font-bold uppercase tracking-wider">
                    {product.brand || 'Intra Decor Signature'} · {product.subCategory || product.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating || '4.9'}</span>
                    <span className="text-gray-400 font-normal">({product.reviewsCount || 24} reviews)</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2c1a1a] mb-3">
                  {product.name}
                </h1>

                {/* Pricing Box */}
                <div className="flex items-baseline gap-3 pb-4 mb-4 border-b border-gray-100">
                  <span className="font-serif text-3xl font-extrabold text-[#4b2c2c]">
                    Rs. {finalPrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      Rs. {price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded font-semibold ml-2">
                    In Stock ({product.stock || 50} units)
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Color swatches if paint */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <label className="text-xs font-bold text-[#4b2c2c] uppercase tracking-wider block mb-2">
                      Available Color Shades:
                    </label>
                    <div className="flex gap-2">
                      {product.colors.map(col => {
                        const isSel = selectedColor?.name === col.name;
                        return (
                          <button
                            key={col.name}
                            onClick={() => setSelectedColor(col)}
                            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                              isSel ? 'border-[#4b2c2c] scale-110 shadow-md ring-2 ring-[#d4a56a]' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {isSel && <Check className="w-4 h-4 text-black/70 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-[#faf8f5] rounded-2xl border border-gray-100 mb-6 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Material Composition</span>
                    <strong className="text-[#4b2c2c]">{product.material || 'Glazed Architectural Grade'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Surface Finish</span>
                    <strong className="text-[#4b2c2c]">{product.finish_type || 'Natural Texture'}</strong>
                  </div>
                  {product.dimensions && (
                    <div>
                      <span className="text-gray-400 block font-medium">Dimensions</span>
                      <strong className="text-[#4b2c2c]">{product.dimensions}</strong>
                    </div>
                  )}
                  {product.coverage && (
                    <div>
                      <span className="text-gray-400 block font-medium">Coverage</span>
                      <strong className="text-[#4b2c2c]">{product.coverage}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Quantity & Add to Cart */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-[#faf8f5] p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-[#4b2c2c]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#d4a56a]" />
                    <span>Add to Shopping Cart</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      isFav
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-400 hover:text-rose-500'
                    }`}
                    title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {addedNotice && (
                  <div className="text-center text-xs text-green-700 bg-green-50 py-2 rounded-xl border border-green-200 font-semibold animate-fadeIn">
                    ✓ Added {quantity} unit(s) to your shopping cart!
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 pt-2">
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#d4a56a]" /> Doorstep Shipping</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#d4a56a]" /> 100% Quality Guaranteed</span>
                  <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-[#d4a56a]" /> 7-Day Replacement</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── CUSTOMER REVIEWS & RATINGS (MATCHING LEGACY give_feedback.php) ── */}
        <div className="mt-12 bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
            <div>
              <span className="text-[#d4a56a] font-serif text-xs font-bold uppercase tracking-wider block mb-1">
                Verified Customer Feedback
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#4b2c2c] flex items-center gap-3">
                <span>Customer Reviews & Experience</span>
                <span className="text-xs bg-[#f4ece1] text-[#7a4040] font-sans font-bold px-2.5 py-0.5 rounded-full">
                  {reviews.length} Verified
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3 bg-[#faf8f5] p-3 rounded-2xl border border-gray-100">
              <div className="text-3xl font-serif font-black text-[#4b2c2c]">{product.rating || '4.8'}</div>
              <div>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Based on {reviews.length} reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews List (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs italic">
                  Be the first to leave an honest review for this architectural piece!
                </div>
              ) : (
                reviews.map((r, i) => (
                  <div key={r.id || i} className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#4b2c2c] text-white flex items-center justify-center font-bold text-xs">
                          {r.userName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-xs text-gray-800">{r.userName}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">Verified Buyer</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{r.date}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form (5 Cols) */}
            <div className="lg:col-span-5 bg-[#fdfbf9] p-6 rounded-2xl border border-brand-border">
              <h3 className="font-serif text-base font-bold text-[#4b2c2c] mb-1">
                Share Your Experience
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Help other homeowners across Pakistan make informed interior choices.
              </p>

              {reviewSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">
                  ✓ Thank you! Your review has been published.
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    placeholder="e.g. Tariq Mahmood"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewReview({ ...newReview, rating: s })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${s <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#4b2c2c] ml-2">{newReview.rating} out of 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Your Review & Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Describe material durability, color accuracy, texture, and overall feel..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reviewSubmitting ? 'Publishing...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-serif text-2xl font-bold text-[#4b2c2c] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

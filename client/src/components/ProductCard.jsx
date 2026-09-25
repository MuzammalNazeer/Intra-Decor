import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Eye, Star, Heart, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = React.useState(false);
  const isFav = isInWishlist(product.id);
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = Math.round(price - (price * discount / 100));

  // Determine image source
  const imageSrc = product.product_image?.startsWith('http')
    ? product.product_image
    : product.product_image
      ? `/uploads/${product.product_image}`
      : '/assets/images/logo.png';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-luxury-hover border border-brand-border transition-all duration-300 flex flex-col relative">
      {/* Image Wrap */}
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden aspect-[4/3] bg-[#f8f5f2]">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Try assets/images fallback
            e.target.onerror = null;
            e.target.src = `/assets/images/${product.product_image || 'Tiles.png'}`;
          }}
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${
            isFav
              ? 'bg-rose-50 text-rose-600 scale-110'
              : 'bg-white/80 hover:bg-white text-gray-400 hover:text-rose-500'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#e74c3c] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
            {discount}% OFF
          </span>
        )}

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#4b2c2c] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
          {product.category}
        </span>

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white text-[#4b2c2c] flex items-center justify-center shadow-lg hover:bg-[#d4a56a] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0">
            <Eye className="w-5 h-5" />
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium text-[#7a4040]">{product.brand || product.subCategory || 'Intra Decor'}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || '4.8'}</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2c1a1a] hover:text-[#7a4040] line-clamp-1 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
            {product.product_type || product.finish_type || 'Premium Quality'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#f0eae4] flex items-center justify-between">
          <div className="flex flex-col">
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                Rs. {price.toLocaleString()}
              </span>
            )}
            <span className="text-base sm:text-lg font-bold text-[#4b2c2c]">
              Rs. {finalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-xs active:scale-95 ${
              justAdded
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                : 'bg-[#4b2c2c] hover:bg-[#6b3c3c] text-white'
            }`}
            title="Add to Cart"
          >
            {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{justAdded ? 'Added!' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

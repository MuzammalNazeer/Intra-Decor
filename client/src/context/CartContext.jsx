import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('intradecor_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('intradecor_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems(prev => {
      const price = Number(product.price) || 0;
      const discount = Number(product.discount) || 0;
      const finalPrice = Math.round(price - (price * discount / 100));
      const key = `${product.id}-${options.selectedColor || 'default'}`;

      const existingIndex = prev.findIndex(item => item.cartKey === key);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        return [
          ...prev,
          {
            cartKey: key,
            productId: product.id,
            name: product.name,
            category: product.category,
            price: price,
            discount: discount,
            finalPrice: finalPrice,
            quantity: quantity,
            image: product.product_image || (product.images && product.images[0]) || 'logo.png',
            selectedColor: options.selectedColor || null,
            finishType: options.finishType || product.finish_type || null
          }
        ];
      }
    });
  };

  const updateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.cartKey === cartKey ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  const rawTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = rawTotal - subtotal;
  const shipping = subtotal > 15000 || subtotal === 0 ? 0 : 500;
  const grandTotal = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        rawTotal,
        totalSavings,
        shipping,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

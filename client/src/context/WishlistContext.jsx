import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('intradecor_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('intradecor_wishlist', JSON.stringify(wishlist));
    // If logged in, optionally sync to server
    if (user?.id) {
      fetch(`/api/favorites/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            // merge
            const serverIds = data.data.map(p => p.id);
            setWishlist(prev => Array.from(new Set([...prev, ...serverIds])));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('intradecor_wishlist', JSON.stringify(next));

      // Sync with server if logged in
      if (user?.id) {
        if (!exists) {
          fetch(`/api/favorites/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          }).catch(() => {});
        } else {
          fetch(`/api/favorites/${user.id}/${productId}`, {
            method: 'DELETE'
          }).catch(() => {});
        }
      }

      return next;
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};

export default WishlistContext;

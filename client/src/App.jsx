import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import NavLinks from './components/NavLinks';
import Footer from './components/Footer';
import AIConsultantModal from './components/AIConsultantModal';
import HouseEstimatorModal from './components/HouseEstimatorModal';

import Home from './pages/Home';
import PaintVisualizer from './pages/PaintVisualizer';
import RoomDesigner from './pages/RoomDesigner';
import Tiles from './pages/Tiles';
import Wallpaper from './pages/Wallpaper';
import WallPanels from './pages/WallPanels';
import Services from './pages/Services';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSafepay from './pages/PaymentSafepay';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative">
      <ScrollToTop />
      
      <Navbar 
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        isMobileNavOpen={isMobileNavOpen}
      />
      
      <NavLinks 
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paint" element={<PaintVisualizer />} />
          <Route path="/room-designer" element={<RoomDesigner />} />
          <Route path="/tiles" element={<Tiles />} />
          <Route path="/wallpaper" element={<Wallpaper />} />
          <Route path="/wallpenals" element={<WallPanels />} />
          <Route path="/services" element={<Services />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/safepay" element={<PaymentSafepay />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating AI Consultant Assistant */}
      <AIConsultantModal onOpenEstimator={() => setIsEstimatorOpen(true)} />

      {/* Whole-House Project Cost Estimator Modal */}
      <HouseEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <MainLayout />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Calendar,
  Heart,
  ShoppingCart,
  User,
  Bell,
  Wrench,
  Store,
  LogOut,
  TrendingUp,
  Settings,
  Phone,
  MapPin,
  Trash2,
  Save,
  Check,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout, isAdmin, setUser } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { cartItems, totalItems, addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Lahore'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || 'Lahore'
      });
    }

    setLoading(true);

    if (isAdmin) {
      Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
      ])
        .then(([statsRes, ordersRes, bookingsRes]) => {
          if (statsRes.success) setStats(statsRes.data);
          if (ordersRes.success) setOrders(ordersRes.data);
          if (bookingsRes.success) setBookings(bookingsRes.data);
        })
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        fetch(`/api/orders/user/${user?.id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`/api/bookings/user/${user?.id}`).then(r => r.json()),
        fetch(`/api/favorites/${user?.id}`).then(r => r.json())
      ])
        .then(([ordersRes, bookingsRes, favsRes]) => {
          if (ordersRes.success) setOrders(ordersRes.data);
          if (bookingsRes.success) setBookings(bookingsRes.data);
          if (favsRes.success) setFavoriteProducts(favsRes.data);
        })
        .finally(() => setLoading(false));
    }
  }, [user, token, isAdmin, navigate]);

  // Refresh favorites when wishlist changes
  useEffect(() => {
    if (!isAdmin && user?.id) {
      fetch(`/api/favorites/${user.id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) setFavoriteProducts(res.data);
        })
        .catch(() => {});
    }
  }, [wishlist, user, isAdmin]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        if (setUser) setUser(data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const navItems = [
    ...(isAdmin ? [
      { id: 'admin', label: 'Executive Overview', icon: TrendingUp, count: null }
    ] : [
      { id: 'overview', label: 'Dashboard Overview', icon: Home, count: null }
    ]),
    { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, count: bookings.length },
    ...(!isAdmin ? [
      { id: 'wishlist', label: 'Favorites', icon: Heart, count: favoriteProducts.length }
    ] : []),
    { id: 'cart', label: 'My Shopping Cart', icon: ShoppingCart, count: totalItems, isLink: true, href: '/cart' },
    { id: 'profile', label: 'Profile Settings', icon: User, count: null },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: 2 },
    { id: 'services', label: 'Hire Services', icon: Wrench, count: null, isLink: true, href: '/services' },
    { id: 'shop', label: 'Go to Shop', icon: Store, count: null, isLink: true, href: '/tiles' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0f0] flex">
      
      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ── LUXURY SIDEBAR (MATCHING ORIGINAL userdashboard.css) ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#4b2c2c] text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-black text-[#d4a56a] tracking-wider">
              Intra Decor
            </span>
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-5 border-b border-white/10 bg-black/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4a56a] text-[#4b2c2c] font-serif font-black flex items-center justify-center text-lg shrink-0 shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-serif text-xs font-bold text-white truncate">
              {user?.name || 'Customer'}
            </h4>
            <span className="text-[10px] text-[#d4a56a] font-semibold uppercase tracking-wider block">
              {user?.role || 'Verified Member'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isLink) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-white/60 group-hover:text-[#d4a56a] transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <span className="bg-[#ffa502] text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#ffa502] text-slate-950 font-bold shadow-md pl-4'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-white/60'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#4b2c2c] text-white' : 'bg-[#ffa502] text-slate-950'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT (MARGIN-LEFT 64 for SIDEBAR) ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#4b2c2c] hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4b2c2c]">
                Welcome, {user?.name || 'Valued Client'}! 👋
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tiles"
              className="bg-[#ffa502] hover:bg-[#e69500] text-slate-950 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </header>

        {/* ── CONTENT BODY ── */}
        <main className="p-4 sm:p-8 flex-1">
          
          {/* STATS SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              onClick={() => setActiveTab('orders')}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">{orders.length}</h3>
              <span className="text-[10px] text-gray-400 mt-1 block">Placed with Intra Decor</span>
            </div>

            <div
              onClick={() => setActiveTab('bookings')}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Artisan Bookings
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">{bookings.length}</h3>
              <span className="text-[10px] text-gray-400 mt-1 block">Service appointments</span>
            </div>

            <div
              onClick={() => setActiveTab('wishlist')}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Saved Favorites
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">{favoriteProducts.length}</h3>
              <span className="text-[10px] text-gray-400 mt-1 block">In your personal wishlist</span>
            </div>

            <Link
              to="/cart"
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Cart Items
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">{totalItems}</h3>
              <span className="text-[10px] text-gray-400 mt-1 block">Ready for checkout</span>
            </Link>
          </div>

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && !isAdmin && (
            <div className="space-y-6">
              {/* Quick Profile Banner */}
              <div className="bg-gradient-to-r from-[#4b2c2c] via-[#5c3535] to-[#2c1a1a] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[#d4a56a] text-xs font-bold uppercase tracking-widest block mb-1">
                    Member Dashboard
                  </span>
                  <h2 className="font-serif text-2xl font-bold">
                    Transforming Spaces with Quality Craftsmanship
                  </h2>
                  <p className="text-xs text-gray-200 mt-2 max-w-xl">
                    Track your orders, schedule appointments with verified local Pakistani artisans, and visualize wall finishes in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/paint"
                    className="bg-[#d4a56a] hover:bg-[#c29358] text-[#2c1a1a] text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Launch Paint Visualizer
                  </Link>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-serif text-base font-bold text-[#4b2c2c]">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#d4a56a] font-bold hover:underline"
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No orders placed yet. Browse our tiles, wallpapers, or paints!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="p-4 rounded-xl bg-[#faf8f5] flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#4b2c2c]">{o.id}</span>
                          <span className="text-xs text-gray-600 block mt-0.5">{o.customerName} · {o.city}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-[#4b2c2c] block">Rs. {o.grandTotal?.toLocaleString()}</span>
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: ADMIN ── */}
          {activeTab === 'admin' && isAdmin && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Total Revenue
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">
                    Rs. {stats.totalRevenue?.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Active Catalog
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">
                    {stats.totalProducts} Products
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Total Orders
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">
                    {stats.totalOrders} Orders
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Installers
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#4b2c2c]">
                    {stats.totalProviders} Artisans
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: ORDERS ── */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#4b2c2c]">
                    {isAdmin ? 'System Orders Pipeline' : 'My Purchase History'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAdmin ? 'Manage logistics and status milestones' : 'Track delivery milestones and invoices'}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-16 rounded-xl animate-shimmer"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No orders found yet.{' '}
                  <Link to="/tiles" className="text-[#4b2c2c] font-bold underline">
                    Browse catalog
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Order ID</th>
                        <th className="pb-3 font-bold">Recipient & City</th>
                        <th className="pb-3 font-bold">Items Count</th>
                        <th className="pb-3 font-bold">Total Amount</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#faf8f5] transition-colors">
                          <td className="py-4 font-mono font-bold text-[#4b2c2c]">{o.id}</td>
                          <td className="py-4">
                            <span className="font-bold text-gray-800 block">{o.customerName}</span>
                            <span className="text-[11px] text-gray-500">{o.city} · {o.phone}</span>
                          </td>
                          <td className="py-4 text-gray-600">{o.items?.length || 1} product(s)</td>
                          <td className="py-4 font-bold text-[#4b2c2c]">
                            Rs. {o.grandTotal?.toLocaleString()}
                          </td>
                          <td className="py-4">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/track-order?query=${encodeURIComponent(o.id)}`}
                                className="bg-[#faf8f5] hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 transition-colors inline-block"
                              >
                                Track
                              </Link>
                              {isAdmin && (
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="bg-white border border-gray-200 text-xs py-1 px-2 rounded-lg text-[#4b2c2c] font-semibold cursor-pointer"
                                >
                                  <option value="Order Placed">Order Placed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Dispatched">Dispatched</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: BOOKINGS ── */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#4b2c2c]">
                    {isAdmin ? 'Installer Service Appointments' : 'My Service Provider Bookings'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Scheduled on-site consultations and installation appointments
                  </p>
                </div>
                <Link
                  to="/services"
                  className="bg-[#ffa502] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#e69500] transition-colors"
                >
                  + Book New Artisan
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No active service bookings found.{' '}
                  <Link to="/services" className="text-[#4b2c2c] font-bold underline">
                    Find verified installers
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Booking ID</th>
                        <th className="pb-3 font-bold">Artisan / Provider</th>
                        <th className="pb-3 font-bold">Service Category</th>
                        <th className="pb-3 font-bold">Appointment Date</th>
                        <th className="pb-3 font-bold">Client Contact</th>
                        <th className="pb-3 font-bold">Status</th>
                        {isAdmin && <th className="pb-3 font-bold text-right">Update</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#faf8f5] transition-colors">
                          <td className="py-4 font-mono font-bold text-[#4b2c2c]">{b.id}</td>
                          <td className="py-4 font-bold text-gray-800">{b.providerName}</td>
                          <td className="py-4">
                            <span className="bg-[#f5eee6] text-[#7a4040] px-2 py-0.5 rounded font-semibold text-[11px]">
                              {b.serviceCategory}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-gray-700">{b.date}</td>
                          <td className="py-4">
                            <span className="block font-semibold">{b.customerName}</span>
                            <span className="text-[11px] text-gray-500">{b.phone} · {b.city}</span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {b.status || 'Confirmed'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-4 text-right">
                              <select
                                value={b.status}
                                onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                className="bg-white border border-gray-200 text-xs py-1 px-2 rounded-lg text-[#4b2c2c] font-semibold cursor-pointer"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: WISHLIST ── */}
          {activeTab === 'wishlist' && !isAdmin && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-gray-100">
                <h2 className="font-serif text-xl font-bold text-[#4b2c2c]">
                  My Saved Architectural Pieces
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tiles, luxury paints, wallpapers, and acoustic panels you bookmarked
                </p>
              </div>

              {favoriteProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Your wishlist is currently empty.{' '}
                  <Link to="/tiles" className="text-[#4b2c2c] font-bold underline">
                    Explore catalogs & tap heart
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((p) => (
                    <div key={p.id} className="border border-gray-200 rounded-2xl p-4 flex gap-4 bg-[#faf8f5]">
                      <img
                        src={p.product_image?.startsWith('http') ? p.product_image : `/uploads/${p.product_image}`}
                        alt={p.name}
                        className="w-20 h-20 object-cover rounded-xl shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `/assets/images/${p.product_image || 'Tiles.png'}`;
                        }}
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#7a4040]">{p.category}</span>
                          <Link to={`/product/${p.id}`} className="font-serif text-sm font-bold text-[#2c1a1a] block hover:underline line-clamp-1">
                            {p.name}
                          </Link>
                          <span className="text-xs font-bold text-[#4b2c2c] block mt-0.5">
                            Rs. {Number(p.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="bg-[#4b2c2c] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#3a2020] transition-colors"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs max-w-2xl">
              <div className="pb-4 mb-6 border-b border-gray-100">
                <h2 className="font-serif text-xl font-bold text-[#4b2c2c]">
                  Contact & Default Delivery Details
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your shipping address and contact telephone for upcoming dispatches
                </p>
              </div>

              {profileSuccess && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Your profile and address details have been updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full bg-[#faf8f5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Lahore, Karachi, Islamabad..."
                    className="w-full bg-[#faf8f5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Street Address</label>
                  <textarea
                    rows={3}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="House number, street, sector, landmark..."
                    className="w-full bg-[#faf8f5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4b2c2c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileSaving ? 'Saving...' : 'Update Details'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ── TAB: NOTIFICATIONS (MATCHING notifications.php) ── */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs max-w-3xl">
              <div className="pb-4 mb-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#4b2c2c]">
                    Account Notifications & Activity
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Order dispatches, service confirmations, and verification receipts
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  2 Unread
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-amber-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Email Address Verified</h4>
                    <p className="text-gray-500 mt-0.5">
                      Your 6-digit OTP code was successfully validated via authenticated courier.
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Welcome to Intra Decor Platform</h4>
                    <p className="text-gray-500 mt-0.5">
                      Explore architectural tile catalogs, 3D visualizers, and Pakistan's top interior artisans.
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

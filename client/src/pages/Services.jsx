import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, MapPin, Star, ShieldCheck, CheckCircle2, Calendar, Clock, X, MessageSquare } from 'lucide-react';

const PAKISTAN_CITIES = {
  'Lahore': ['All Areas', 'DHA', 'Gulberg', 'Johar Town', 'Bahria Town'],
  'Karachi': ['All Areas', 'DHA Karachi', 'Clifton', 'Gulshan-e-Iqbal', 'Saddar'],
  'Islamabad': ['All Areas', 'F-7', 'F-10', 'Bahria Town', 'DHA Islamabad'],
  'Rawalpindi': ['All Areas', 'Bahria Town', 'Saddar', 'Westridge', 'Satellite Town'],
  'Faisalabad': ['All Areas', 'Gulberg', 'Madina Town', 'Canal Road', 'Susan Road'],
  'Multan': ['All Areas', 'Cantt', 'Gulgasht', 'Shah Rukn-e-Alam', 'New Multan'],
  'Gujranwala': ['All Areas', 'GT Road', 'Satellite Town', 'Model Town', 'Peoples Colony'],
  'Sialkot': ['All Areas', 'Cantt', 'Allama Iqbal Road', 'Hajipura', 'Paris Road'],
  'Peshawar': ['All Areas', 'Hayatabad', 'University Road', 'Cantt', 'Saddar'],
  'Quetta': ['All Areas', 'Cantt', 'Satellite Town', 'Jinnah Road', 'Sariab Road'],
  'Sheikhupura': ['All Areas', 'Housing Colony', 'Ghang Road', 'Bhikhi Road'],
  'Farooqabad': ['All Areas', 'Farooqabad City', 'GT Road', 'Railway Road']
};

const CATEGORIES = ['All Categories', 'Paint', 'Tiles', 'Wallpaper', 'Wall Panelling'];

export default function Services() {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingProvider, setBookingProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    date: '',
    notes: ''
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    let url = '/api/services/providers?';
    if (selectedCity !== 'All') {
      url += `city=${encodeURIComponent(selectedCity)}&`;
    }
    if (selectedArea !== 'All Areas') {
      url += `area=${encodeURIComponent(selectedArea)}&`;
    }
    if (selectedCategory !== 'All Categories') {
      url += `category=${encodeURIComponent(selectedCategory)}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProviders(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCity, selectedArea, selectedCategory]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedArea('All Areas');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/services/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: bookingProvider.id,
          providerName: bookingProvider.name,
          serviceCategory: bookingProvider.category,
          customerName: bookingForm.name,
          phone: bookingForm.phone,
          city: bookingProvider.city,
          area: bookingProvider.area,
          date: bookingForm.date,
          notes: bookingForm.notes,
          userId: user?.id || 'guest'
        })
      });
      setBookingSubmitted(true);
      setTimeout(() => {
        setBookingSubmitted(false);
        setBookingProvider(null);
        setBookingForm({ name: user?.name || '', phone: user?.phone || '', date: '', notes: '' });
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-[#f5f0f0] pb-24">
      
      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-r from-[#4b2c2c] via-[#5c3030] to-[#2b1717] text-white py-14 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-[#d4a56a] font-serif text-xs font-bold uppercase tracking-widest block mb-2">
            Verified Local Artisans
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">
            Hire Professional Interior Service Providers
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-xl mx-auto leading-relaxed">
            Connect with background-checked painters, tile layers, wallpaper mounting experts, and acoustic panel installers in your city.
          </p>
        </div>
      </div>

      {/* ── FILTER BAR (MATCHING ORIGINAL services.php) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-brand-border p-5 flex flex-wrap items-center gap-4 justify-between">
          
          <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[280px]">
            {/* City Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#4b2c2c] uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#d4a56a]" />
                <span>City:</span>
              </label>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="bg-[#faf8f5] text-xs font-medium text-[#4b2c2c] py-2 px-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
              >
                <option value="All">All Cities in Pakistan</option>
                {Object.keys(PAKISTAN_CITIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Area Dropdown */}
            {selectedCity !== 'All' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[#4b2c2c] uppercase">Area:</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="bg-[#faf8f5] text-xs font-medium text-[#4b2c2c] py-2 px-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
                >
                  {(PAKISTAN_CITIES[selectedCity] || ['All Areas']).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#4b2c2c] uppercase">Skill:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#faf8f5] text-xs font-medium text-[#4b2c2c] py-2 px-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            {providers.length} Verified Providers Available
          </div>

        </div>
      </div>

      {/* ── PROVIDER CARDS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl animate-shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded animate-shimmer"></div>
                    <div className="h-3 w-1/2 rounded animate-shimmer"></div>
                    <div className="h-3 w-1/4 rounded animate-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-border p-8">
            <p className="text-gray-500 text-sm mb-4">No service providers found for the selected city and trade.</p>
            <button
              onClick={() => { setSelectedCity('All'); setSelectedArea('All Areas'); setSelectedCategory('All Categories'); }}
              className="bg-[#4b2c2c] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#3a2020]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((p) => {
              const imageSrc = `/uploads/${p.profile_image || 'provider1.png'}`;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Header */}
                    <div className="flex items-start gap-4">
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-black/10 flex-shrink-0 bg-[#faf8f5]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/logo.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="bg-[#4b2c2c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{p.badge || 'Verified Pro'}</span>
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#2c1a1a] truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          Master Craftsman: <span className="text-gray-800">{p.owner}</span> ({p.experienceYears} yrs exp)
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                            <span className="text-gray-400 font-normal">({p.completedJobs} jobs)</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-[#d4a56a]" />
                            <span>{p.city} · {p.area}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-600 leading-relaxed mt-4 line-clamp-2">
                      {p.bio}
                    </p>

                    {/* Rates & Services Tags */}
                    <div className="mt-3 flex items-center justify-between bg-[#faf8f5] p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Starting Rates</span>
                        <span className="text-xs font-bold text-[#4b2c2c]">{p.rates}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {(p.services || []).slice(0, 2).map((srv, idx) => (
                          <span key={idx} className="bg-white text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-200">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Call & Book */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <a
                      href={`tel:${p.phone}`}
                      className="flex-1 bg-[#faf8f5] hover:bg-gray-100 text-[#4b2c2c] border border-gray-200 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#d4a56a]" />
                      <span>{p.phone}</span>
                    </a>
                    
                    <button
                      onClick={() => setBookingProvider(p)}
                      className="flex-1 bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#d4a56a]" />
                      <span>Book Free Visit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BOOKING MODAL ── */}
      {bookingProvider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border relative">
            <button
              onClick={() => setBookingProvider(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#4b2c2c]">
                  Consultation Booked!
                </h3>
                <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                  {bookingProvider.name} has received your booking details and will call {bookingForm.phone} shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-[#d4a56a] uppercase tracking-widest block mb-1">
                    Free Measurement & Quote
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#4b2c2c]">
                    Book {bookingProvider.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bookingProvider.city} · {bookingProvider.area}
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full bg-[#faf8f5] text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Phone Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300 1234567"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="w-full bg-[#faf8f5] text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Preferred Visit Date</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full bg-[#faf8f5] text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Job Details & Room Notes</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Need living room wall panelling and paint in DHA..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      className="w-full bg-[#faf8f5] text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md mt-2"
                  >
                    Confirm Booking Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

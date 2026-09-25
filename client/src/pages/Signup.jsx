import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const { sendSignupOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await sendSignupOtp(form);
    setLoading(false);

    if (res.success) {
      // Navigate to OTP verification screen with email and previewOtp
      navigate('/verify-otp', {
        state: {
          email: form.email,
          name: form.name,
          previewOtp: res.data?.previewOtp
        }
      });
    } else {
      setError(res.error || 'Failed to send verification code');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-14 px-4 flex items-center justify-center pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-md">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img 
              src="/assets/images/logo.png" 
              alt="Intra Decor" 
              className="h-12 w-auto mx-auto rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/uploads/logo.png';
              }}
            />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#4b2c2c]">
            Join Intra Decor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create an account to shop, track shipments, and receive your email verification code
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Usman Tariq"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address (For Verification Code) *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. usman@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number (WhatsApp)</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. 0347 9814741"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Create secure password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Account Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-[#faf8f5] text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c] cursor-pointer"
            >
              <option value="customer">Homeowner / Customer</option>
              <option value="seller">Seller / Manufacturer</option>
              <option value="provider">Service Provider / Installer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <span>{loading ? 'Sending Verification Code...' : 'Send Verification Code'}</span>
            <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d4a56a]" />
          <span>A 6-digit OTP code will be sent to your email to verify</span>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          Already registered?{' '}
          <Link to="/login" className="text-[#4b2c2c] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}

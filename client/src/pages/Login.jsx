import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to login');
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@intradecor.com');
      setPassword('password123');
    } else {
      setEmail('user@intradecor.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-16 px-4 flex items-center justify-center pb-24">
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
            Sign In to Intra Decor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Access your orders, saved paint palettes, and project consultations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@intradecor.com"
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">Password</label>
              <span className="text-[11px] text-[#7a4040] hover:underline cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#faf8f5] text-xs py-3 pl-10 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4b2c2c]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-2.5">
            Instant Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('user')}
              className="py-2 px-3 bg-[#faf8f5] hover:bg-gray-100 rounded-xl text-xs font-semibold text-[#4b2c2c] border border-gray-200 transition-colors"
            >
              Demo Customer
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 bg-[#faf8f5] hover:bg-gray-100 rounded-xl text-xs font-semibold text-[#4b2c2c] border border-gray-200 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#4b2c2c] font-bold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}

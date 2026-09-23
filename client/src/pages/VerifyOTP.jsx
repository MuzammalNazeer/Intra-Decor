import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifySignupOtp, resendSignupOtp } = useAuth();

  const email = location.state?.email || '';
  const name = location.state?.name || '';
  const initialPreviewOtp = location.state?.previewOtp || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [previewCode, setPreviewCode] = useState(initialPreviewOtp);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [timer, setTimer] = useState(60);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }
    // Focus first input box
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only last character
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of your verification code');
      return;
    }

    setLoading(true);
    setError('');

    const res = await verifySignupOtp(email, fullOtp);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Verification failed. Please check the code.');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    setResendSuccess('');

    const res = await resendSignupOtp(email);
    setResending(false);

    if (res.success) {
      setTimer(60);
      setResendSuccess('New verification code sent to your email!');
      if (res.data?.previewOtp) {
        setPreviewCode(res.data.previewOtp);
      }
      setTimeout(() => setResendSuccess(''), 4000);
    } else {
      setError(res.error || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] py-14 px-4 flex items-center justify-center pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-md">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#faf0ea] text-[#4b2c2c] border border-[#ecd5c5] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail className="w-8 h-8 text-[#d4a56a]" />
          </div>
          <span className="text-[10px] font-bold text-[#d4a56a] uppercase tracking-widest block mb-1">
            Email Verification
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#4b2c2c]">
            Enter 6-Digit Code
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            We have sent a verification code to <br />
            <strong className="text-gray-800">{email}</strong>
          </p>
        </div>

        {/* Demo Fast Fill Badge (So user is never stuck) */}
        {previewCode && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              📬 Sent Verification Code:
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono text-xl font-black text-[#4b2c2c] tracking-widest bg-white px-3 py-1 rounded border border-amber-300">
                {previewCode}
              </span>
              <button
                type="button"
                onClick={() => setOtp(previewCode.split(''))}
                className="text-[11px] bg-[#4b2c2c] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#3a2020] transition-colors"
              >
                Auto Fill
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-medium text-center">
            ✓ {resendSuccess}
          </div>
        )}

        {/* 6-BOX DIGIT INPUT */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                  digit
                    ? 'border-[#4b2c2c] bg-[#faf3ed] text-[#4b2c2c]'
                    : 'border-gray-200 bg-[#faf8f5] text-gray-800 focus:border-[#d4a56a]'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4b2c2c] hover:bg-[#3a2020] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{loading ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
            <ArrowRight className="w-4 h-4 text-[#d4a56a]" />
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Didn't receive the email code? Check spam folder or resend.
          </p>
          <button
            type="button"
            disabled={timer > 0 || resending}
            onClick={handleResend}
            className={`text-xs font-bold transition-colors ${
              timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#4b2c2c] hover:underline'
            }`}
          >
            {timer > 0 ? `Resend Code in ${timer}s` : 'Resend New Verification Code'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/signup" className="text-[11px] text-gray-400 hover:text-gray-600">
            ← Change email address or go back
          </Link>
        </div>

      </div>
    </div>
  );
}

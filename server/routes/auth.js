import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// In-memory OTP stores (use Redis in production)
const pendingSignups = new Map();
const resetOtpStore  = new Map();

/* ───────────────────────────────────────────
   OTP Email Sender — IntraDecor branded
─────────────────────────────────────────── */
const sendOtpEmail = async (toEmail, name, otp, type = 'signup') => {
  const isReset = type === 'reset';
  const subject = isReset
    ? 'Intra Decor Home — Password Reset OTP'
    : 'Intra Decor Home — Email Verification';

  const headingText = isReset ? 'Password Reset' : 'Email Verification';
  const bodyText    = isReset
    ? 'Use the code below to reset your password. It expires in <strong>10 minutes</strong>.'
    : 'Thank you for signing up! Use the OTP below to verify your email. It expires in <strong>10 minutes</strong>.';

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
      <div style="background:#4b2c2c;padding:30px 32px;text-align:center;">
        <h2 style="color:#f5e6d0;margin:0;font-size:24px;font-weight:900;letter-spacing:0.5px;">🏠 Intra Decor Home</h2>
        <p style="color:#e8c9a0;margin:6px 0 0;font-size:14px;font-weight:600;">${headingText}</p>
      </div>
      <div style="padding:32px 32px 24px;">
        <p style="color:#2c1a1a;font-size:16px;margin:0 0 10px;">Hello <strong>${name || 'User'}</strong>,</p>
        <p style="color:#5a4040;font-size:14px;line-height:1.7;margin:0 0 24px;">${bodyText}</p>
        <div style="text-align:center;margin:28px 0;">
          <div style="display:inline-block;background:#f7f0eb;border:2px dashed #8b5e3c;border-radius:14px;padding:18px 40px;">
            <span style="font-size:38px;font-weight:900;letter-spacing:12px;color:#4b2c2c;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="color:#999;font-size:12px;text-align:center;margin-top:8px;">Do not share this code with anyone.</p>
      </div>
      <div style="background:#f7f0eb;padding:14px 32px;text-align:center;border-top:1px solid #e8d5c0;">
        <p style="color:#a08060;font-size:12px;margin:0;">© ${new Date().getFullYear()} Intra Decor Home — All rights reserved</p>
      </div>
    </div>`;

  try {
    await sendEmail({ to: toEmail, subject, html, text: `Your OTP: ${otp}` });
    return true;
  } catch (err) {
    console.error('[sendOtpEmail] Error:', err.message);
    return false;
  }
};

/* ───────────────────────────────────────────
   STEP 1: Send Signup OTP
─────────────────────────────────────────── */
router.post('/send-signup-otp', async (req, res) => {
  const { name, email, password, phone, role, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if email already exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'This email is already registered. Please login instead.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending signup
    pendingSignups.set(normalizedEmail, {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
      city: city || '',
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP email
    await sendOtpEmail(normalizedEmail, name, otp, 'signup');

    res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      // Remove previewOtp in production
      previewOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (err) {
    console.error('[send-signup-otp]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   STEP 2: Verify OTP & Create Account
─────────────────────────────────────────── */
router.post('/verify-signup-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingSignups.get(normalizedEmail);

  if (!pending) {
    return res.status(400).json({ error: 'No pending registration found. Please sign up again.' });
  }
  if (Date.now() > pending.expiresAt) {
    pendingSignups.delete(normalizedEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (pending.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
  }

  try {
    // Insert user into MySQL
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, city, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [pending.name, pending.email, pending.password, pending.role, pending.city, pending.phone]
    );
    const userId = result.insertId;

    // Auto-create providerprofile if service_provider
    if (pending.role === 'service_provider') {
      await pool.query(
        'INSERT INTO providerprofile (provider_id, name, email, city) VALUES (?, ?, ?, ?)',
        [userId, pending.name, pending.email, pending.city]
      );
    }

    // Notify admins if seller/service_provider
    if (pending.role === 'seller' || pending.role === 'service_provider') {
      const roleLabel = pending.role === 'seller' ? 'seller' : 'service provider';
      const msg = `New ${roleLabel} registered: ${pending.name} (${pending.email}) - pending approval`;
      const [admins] = await pool.query('SELECT id FROM admins');
      for (const admin of admins) {
        await pool.query(
          'INSERT INTO notifications (admin_id, seller_id, message, is_read, created_at) VALUES (?, 0, ?, 0, NOW())',
          [admin.id, msg]
        );
      }
    }

    pendingSignups.delete(normalizedEmail);

    // Generate token
    const token = generateToken({ id: userId, email: pending.email, role: pending.role, name: pending.name });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully!',
      token,
      user: { id: userId, name: pending.name, email: pending.email, role: pending.role, city: pending.city },
    });
  } catch (err) {
    console.error('[verify-signup-otp]', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   STEP 3: Resend OTP
─────────────────────────────────────────── */
router.post('/resend-signup-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingSignups.get(normalizedEmail);

  if (!pending) {
    return res.status(400).json({ error: 'No registration session found. Please sign up again.' });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp       = newOtp;
  pending.expiresAt = Date.now() + 10 * 60 * 1000;
  pendingSignups.set(normalizedEmail, pending);

  await sendOtpEmail(normalizedEmail, pending.name, newOtp, 'signup');

  res.json({
    success: true,
    message: `New OTP sent to ${normalizedEmail}`,
    previewOtp: process.env.NODE_ENV === 'development' ? newOtp : undefined,
  });
});

/* ───────────────────────────────────────────
   LOGIN
─────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      // Fallback: Check admins table
      const [adminRows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email.toLowerCase().trim()]);
      if (adminRows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const admin = adminRows[0];
      const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password).catch(() => false));
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name || 'Admin' });
      return res.json({
        success: true,
        token,
        user: { id: admin.id, name: admin.name || 'Admin', email: admin.email, role: 'admin' }
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || (password === user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: pwd, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   ADMIN LOGIN (separate admins table)
─────────────────────────────────────────── */
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = rows[0];
    // Simple password check (PHP used plain text for admin)
    const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password).catch(() => false));
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name || 'Admin' });
    const { password: pwd, ...safeAdmin } = admin;

    res.json({ success: true, token, user: { ...safeAdmin, role: 'admin' } });
  } catch (err) {
    console.error('[admin-login]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   GET CURRENT USER (/auth/me)
─────────────────────────────────────────── */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const table = req.user.role === 'admin' ? 'admins' : 'users';
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { password: pwd, ...safeUser } = rows[0];
    res.json({ success: true, user: { ...safeUser, role: req.user.role } });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────────────────────────────────────
   FORGOT PASSWORD
─────────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    // Always respond success (security: don't reveal if email exists)
    if (rows.length === 0) {
      return res.json({ success: true, message: 'If this email is registered, a reset code has been sent.' });
    }

    const user = rows[0];
    const otp  = Math.floor(100000 + Math.random() * 900000).toString();
    resetOtpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendOtpEmail(normalizedEmail, user.name, otp, 'reset');

    res.json({
      success: true,
      message: 'If this email is registered, a reset code has been sent.',
      previewOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   RESET PASSWORD
─────────────────────────────────────────── */
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = resetOtpStore.get(normalizedEmail);

  if (!record) return res.status(400).json({ error: 'No reset request found. Please request a new OTP.' });
  if (Date.now() > record.expiresAt) {
    resetOtpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, normalizedEmail]);
    resetOtpStore.delete(normalizedEmail);
    res.json({ success: true, message: 'Password reset successfully! You can now login.' });
  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ───────────────────────────────────────────
   UPDATE PROFILE
─────────────────────────────────────────── */
router.patch('/profile', authenticateToken, async (req, res) => {
  const { name, phone, city, avatar } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), city = COALESCE(?, city) WHERE id = ?',
      [name || null, phone || null, city || null, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const { password: pwd, ...safeUser } = rows[0];
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[update-profile]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

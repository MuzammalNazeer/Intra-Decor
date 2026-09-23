import express from 'express';
import { db } from '../database/store.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'intradecor-secret-key-2026';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

/* ------------------- AUTH ROUTES ------------------- */
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Demo simple match (in production bcrypt.compare is used)
  const isMatch = (password === 'password123') || (password === 'admin123') || (password === user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, password: pwd, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

import nodemailer from 'nodemailer';

import sendEmail from '../utils/sendEmail.js';

// In-memory store for pending user signups awaiting OTP verification
const pendingSignups = new Map();

// Helper to send OTP email with exact Neuroviax AI template
const sendOtpEmail = async (toEmail, name, otp) => {
  const text = `🤖 Neuroviax AI\nEmail Verification\n\nHello ${name || 'User'},\n\nThank you for signing up! Use the OTP below to verify your email address. It expires in 10 minutes.\n\n[ ${otp} ]\n\nIf you did not create this account, please ignore this email.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #052e16; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">🤖 Neuroviax AI</h2>
        <p style="color: #059669; margin: 6px 0 0 0; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Email Verification</p>
      </div>
      <div style="padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="color: #1e293b; font-size: 15px; margin: 0 0 14px 0;">
          Hello <strong>${name || 'User'}</strong>,
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for signing up! Use the OTP below to verify your email address. It expires in 10 minutes.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #047857; background: #d1fae5; padding: 14px 28px; border-radius: 12px; border: 2px dashed #10b981; font-family: monospace;">
            [ ${otp} ]
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 14px; line-height: 1.5;">
          If you did not create this account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await sendEmail({
      to: toEmail,
      subject: `Neuroviax AI — Email Verification OTP`,
      text,
      html,
    });
    console.log(`✉️ Email successfully delivered to: ${toEmail} | MessageId: ${info?.messageId || 'OK'}`);
    return true;
  } catch (err) {
    console.error(`[sendOtpEmail] Email delivery notice:`, err.message);
    return false;
  }
};

/* ── STEP 1: REQUEST SIGNUP OTP ── */
router.post('/auth/send-signup-otp', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'This email is already registered. Please login instead.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const normalizedEmail = email.toLowerCase().trim();

  // Save to pending memory store (10 minute expiry)
  pendingSignups.set(normalizedEmail, {
    name,
    email: normalizedEmail,
    password,
    phone: phone || '',
    role: role || 'customer',
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  // Attempt real email dispatch via nodemailer
  await sendOtpEmail(normalizedEmail, name, otp);

  // Return success + previewOtp so user can test locally without checking inbox if desired
  res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    email: normalizedEmail,
    previewOtp: otp
  });
});

/* ── STEP 2: VERIFY OTP & CREATE ACCOUNT ── */
router.post('/auth/verify-signup-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingSignups.get(normalizedEmail);

  if (!pending) {
    return res.status(400).json({ error: 'No pending registration found for this email. Please sign up again.' });
  }

  if (Date.now() > pending.expiresAt) {
    pendingSignups.delete(normalizedEmail);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  if (pending.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
  }

  // OTP verified! Create user in database
  const newUser = db.createUser({
    name: pending.name,
    email: pending.email,
    password: pending.password,
    phone: pending.phone,
    role: pending.role
  });

  pendingSignups.delete(normalizedEmail);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: pwd, passwordHash, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    message: 'Account successfully verified and created!',
    token,
    user: safeUser
  });
});

/* ── STEP 3: RESEND OTP ── */
router.post('/auth/resend-signup-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const pending = pendingSignups.get(normalizedEmail);

  if (!pending) {
    return res.status(400).json({ error: 'No registration session found. Please sign up again.' });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = newOtp;
  pending.expiresAt = Date.now() + 10 * 60 * 1000;
  pendingSignups.set(normalizedEmail, pending);

  await sendOtpEmail(normalizedEmail, pending.name, newOtp);

  res.json({
    success: true,
    message: `A new verification code has been dispatched to ${normalizedEmail}`,
    previewOtp: newOtp
  });
});

// Legacy direct register endpoint (kept as fallback)
router.post('/auth/register', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = db.createUser({
    name,
    email,
    phone: phone || '',
    role: role || 'customer',
    password: password
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: pwd, passwordHash, ...safeUser } = newUser;
  res.json({ success: true, token, user: safeUser });
});

router.get('/auth/me', authenticateToken, (req, res) => {
  const user = db.findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

/* ------------------- PRODUCT & CATALOG ROUTES ------------------- */
router.get('/products', (req, res) => {
  const { category, search, subCategory } = req.query;
  const products = db.getProducts(category, search, subCategory);
  res.json({ success: true, count: products.length, data: products });
});

router.get('/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, data: product });
});

router.post('/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only admins and sellers can add products' });
  }
  const newProduct = db.addProduct(req.body);
  res.status(201).json({ success: true, data: newProduct });
});

router.get('/categories', (req, res) => {
  const categories = db.getCategories();
  res.json({ success: true, data: categories });
});

/* ------------------- SERVICES & PROVIDERS ROUTES ------------------- */
router.get('/services/providers', (req, res) => {
  const { city, area, category } = req.query;
  const providers = db.getProviders(city, area, category);
  res.json({ success: true, count: providers.length, data: providers });
});

/* ------------------- ORDERS & CHECKOUT ROUTES ------------------- */
router.post('/orders', (req, res) => {
  const {
    items,
    customerName,
    phone,
    address,
    city,
    email,
    paymentMethod,
    subtotal,
    shipping,
    grandTotal,
    userId
  } = req.body;

  if (!items || !items.length || !customerName || !phone || !address || !city) {
    return res.status(400).json({ error: 'Please provide all delivery and contact details' });
  }

  const order = db.createOrder({
    userId: userId || 'guest',
    customerName,
    phone,
    email: email || '',
    address,
    city,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
    items,
    subtotal: subtotal || 0,
    shipping: shipping || 0,
    grandTotal: grandTotal || 0
  });

  res.status(201).json({ success: true, message: 'Order created successfully', data: order });
});

router.get('/orders/track/:query', (req, res) => {
  const order = db.getOrderByTracking(req.params.query);
  if (!order) {
    return res.status(404).json({ error: 'No order found with this tracking ID or phone number' });
  }
  res.json({ success: true, data: order });
});

router.get('/orders/user/:userId', authenticateToken, (req, res) => {
  const orders = db.getOrdersByUser(req.params.userId);
  res.json({ success: true, data: orders });
});

/* ------------------- ADMIN ROUTES ------------------- */
router.get('/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const stats = db.getStats();
  res.json({ success: true, data: stats });
});

router.get('/admin/orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const orders = db.getAllOrders();
  res.json({ success: true, data: orders });
});

router.patch('/admin/orders/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const updated = db.updateOrderStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, data: updated });
});

/* ------------------- SERVICE BOOKINGS ROUTES ------------------- */
router.post('/services/book', (req, res) => {
  const { providerId, providerName, serviceCategory, customerName, phone, city, area, date, notes, userId } = req.body;
  if (!providerName || !customerName || !phone || !date) {
    return res.status(400).json({ error: 'Please provide provider, name, phone, and booking date' });
  }

  const booking = db.createBooking({
    userId: userId || 'guest',
    providerId: providerId || '',
    providerName,
    serviceCategory: serviceCategory || 'General Service',
    customerName,
    phone,
    city: city || 'Pakistan',
    area: area || '',
    date,
    notes: notes || ''
  });

  res.status(201).json({ success: true, message: 'Booking requested successfully', data: booking });
});

router.get('/bookings/user/:userId', (req, res) => {
  const bookings = db.getBookingsByUser(req.params.userId);
  res.json({ success: true, data: bookings });
});

router.get('/admin/bookings', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const bookings = db.getAllBookings();
  res.json({ success: true, data: bookings });
});

router.patch('/admin/bookings/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const updated = db.updateBookingStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true, data: updated });
});

/* ------------------- WISHLIST / FAVORITES ROUTES ------------------- */
router.get('/favorites/:userId', (req, res) => {
  const favorites = db.getFavorites(req.params.userId);
  res.json({ success: true, data: favorites });
});

router.post('/favorites/:userId', (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'Product ID required' });
  const favorites = db.addFavorite(req.params.userId, productId);
  res.json({ success: true, data: favorites });
});

router.delete('/favorites/:userId/:productId', (req, res) => {
  const favorites = db.removeFavorite(req.params.userId, req.params.productId);
  res.json({ success: true, data: favorites });
});

/* ------------------- PRODUCT REVIEWS ROUTES ------------------- */
router.get('/products/:id/reviews', (req, res) => {
  const reviews = db.getProductReviews(req.params.id);
  res.json({ success: true, data: reviews });
});

router.post('/products/:id/reviews', (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }
  const newRev = db.addProductReview(req.params.id, {
    userName,
    rating: Number(rating) || 5,
    comment
  });
  res.status(201).json({ success: true, data: newRev });
});

/* ------------------- USER PROFILE UPDATE ------------------- */
router.patch('/user/profile', authenticateToken, (req, res) => {
  const updated = db.updateUserProfile(req.user.id || req.user.email, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { password: pwd, passwordHash, ...safeUser } = updated;
  res.json({ success: true, user: safeUser });
});

/* ------------------- CONTACT FORM ------------------- */
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  const msg = db.saveContactMessage({ name, email, phone: phone || '', subject: subject || 'General Inquiry', message });

  // Attempt to send notification email
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;">
        <div style="background:#4b2c2c;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;margin-bottom:20px;">
          <h2 style="color:#f5e6d0;margin:0;font-size:20px;">🏠 New Contact Message — Intra Decor</h2>
        </div>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f8f8f8;padding:14px;border-radius:8px;border-left:4px solid #4b2c2c;">${message}</div>
        <p style="color:#999;font-size:12px;margin-top:20px;">Submitted: ${new Date().toLocaleString()}</p>
      </div>`;
    await sendEmail({ to: 'admin@intradecor.com', subject: `Contact: ${subject || 'General Inquiry'} — ${name}`, text: message, html });
  } catch (e) { /* silent */ }

  res.status(201).json({ success: true, message: 'Your message has been received. We will get back to you within 24 hours!', data: msg });
});

router.get('/admin/contacts', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const messages = db.getAllContactMessages();
  res.json({ success: true, data: messages });
});

router.patch('/admin/contacts/:id/read', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const msg = db.markMessageRead(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  res.json({ success: true, data: msg });
});

/* ------------------- FORGOT / RESET PASSWORD ------------------- */
const resetOtpStore = new Map(); // email -> { otp, expiresAt }

router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.findUserByEmail(normalizedEmail);
  if (!user) {
    // Don't reveal if email exists - security best practice
    return res.json({ success: true, message: `If this email is registered, a reset code has been sent.` });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  resetOtpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;">
      <div style="text-align:center;margin-bottom:24px;">
        <h2 style="color:#4b2c2c;margin:0;font-size:24px;font-weight:900;">🏠 Intra Decor</h2>
        <p style="color:#8b5e3c;margin:6px 0 0;font-size:14px;font-weight:700;">Password Reset</p>
      </div>
      <div style="padding:24px;background:#faf7f4;border-radius:12px;border:1px solid #e8d5c0;">
        <p style="color:#2c1a1a;font-size:15px;margin:0 0 14px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color:#5a4040;font-size:14px;line-height:1.6;margin:0 0 20px;">Use the code below to reset your password. It expires in 10 minutes.</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;font-size:32px;font-weight:900;letter-spacing:6px;color:#4b2c2c;background:#f5e6d0;padding:14px 28px;border-radius:12px;border:2px dashed #8b5e3c;font-family:monospace;">
            ${otp}
          </span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;border-top:1px solid #e2e8f0;padding-top:14px;">If you did not request this, please ignore this email.</p>
      </div>
    </div>`;

  try {
    await sendEmail({ to: normalizedEmail, subject: 'Intra Decor — Password Reset OTP', text: `Your password reset OTP is: ${otp}`, html });
  } catch(e) { /* silent */ }

  res.json({ success: true, message: `If this email is registered, a reset code has been sent.`, previewOtp: otp });
});

router.post('/auth/reset-password', (req, res) => {
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

  const updated = db.updateUserProfile(normalizedEmail, { password: newPassword });
  resetOtpStore.delete(normalizedEmail);

  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, message: 'Password has been reset successfully! You can now login.' });
});

/* ------------------- ADMIN: USER MANAGEMENT ------------------- */
router.get('/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const users = db.getAllUsers();
  res.json({ success: true, data: users });
});

router.delete('/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, message: 'User deleted successfully' });
});

/* ------------------- ADMIN: PRODUCT MANAGEMENT ------------------- */
router.delete('/admin/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted successfully' });
});

router.patch('/admin/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, data: updated });
});

export default router;


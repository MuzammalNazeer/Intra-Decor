import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/* ─────────────────────────────────────────
   GET SERVICE PROVIDERS (with filters)
───────────────────────────────────────── */
router.get('/providers', async (req, res) => {
  const { city, category } = req.query;
  try {
    let query  = `SELECT providerprofile.*, users.name, users.email, users.city
                  FROM providerprofile
                  JOIN users ON providerprofile.provider_id = users.id
                  WHERE users.status = 'approved'`;
    const params = [];

    if (city) {
      query += ' AND users.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (category) {
      query += ' AND providerprofile.service_category = ?';
      params.push(category);
    }

    query += ' ORDER BY providerprofile.id DESC';
    const [providers] = await pool.query(query, params);
    res.json({ success: true, data: providers });
  } catch (err) {
    // Table might not exist yet
    res.json({ success: true, data: [] });
  }
});

/* ─────────────────────────────────────────
   BOOK A SERVICE
───────────────────────────────────────── */
router.post('/book', authenticateToken, async (req, res) => {
  const { provider_id, service_category, date, notes } = req.body;
  if (!provider_id || !date) {
    return res.status(400).json({ error: 'Provider ID and date are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, provider_id, service_category, booking_date, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [req.user.id, provider_id, service_category || 'General', date, notes || '']
    );
    res.status(201).json({ success: true, message: 'Service booked successfully!', bookingId: result.insertId });
  } catch (err) {
    console.error('[POST /services/book]', err);
    res.status(500).json({ error: 'Server error booking service' });
  }
});

/* ─────────────────────────────────────────
   MY BOOKINGS (User)
───────────────────────────────────────── */
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT bookings.*, users.name as provider_name, users.email as provider_email
       FROM bookings
       JOIN users ON bookings.provider_id = users.id
       WHERE bookings.user_id = ?
       ORDER BY bookings.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  try {
    // Try to save to DB (optional)
    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, phone || '', subject || 'General Inquiry', message]
    ).catch(() => {}); // Ignore if table doesn't exist

    // Send email to admin
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#4b2c2c;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px;">
          <h2 style="color:#f5e6d0;margin:0;">🏠 New Contact — Intra Decor</h2>
        </div>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f8f8f8;padding:14px;border-radius:8px;border-left:4px solid #4b2c2c;">${message}</div>
        <p style="color:#999;font-size:12px;margin-top:20px;">Submitted: ${new Date().toLocaleString()}</p>
      </div>`;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@intradecor.com';
    sendEmail({
      to: adminEmail,
      subject: `Contact: ${subject || 'General Inquiry'} — ${name}`,
      text: message,
      html,
    }).catch(() => {});

    res.status(201).json({ success: true, message: 'Your message has been received! We will get back to you within 24 hours.' });
  } catch (err) {
    console.error('[POST /contact]', err);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

/* ─────────────────────────────────────────
   NEWSLETTER SUBSCRIBE
───────────────────────────────────────── */
router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await pool.query(
      'INSERT IGNORE INTO newsletter (email, subscribed_at) VALUES (?, NOW())',
      [email.toLowerCase().trim()]
    ).catch(() => {});
    res.json({ success: true, message: 'Subscribed to newsletter successfully!' });
  } catch (err) {
    res.json({ success: true, message: 'Subscribed!' });
  }
});

/* ─────────────────────────────────────────
   FAVORITES
───────────────────────────────────────── */
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const [favs] = await pool.query(
      `SELECT favorites.*, productadd.name, productadd.price, productadd.discount,
              productadd.product_image, productadd.category
       FROM favorites
       JOIN productadd ON favorites.product_id = productadd.id
       WHERE favorites.user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: favs });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

router.post('/favorites', authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID required' });
  try {
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/favorites/:productId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

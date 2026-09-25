import express from 'express';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// Helper to extract user ID from optional Bearer token
function getOptionalUserId(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intradecor_jwt_secret_key_2026');
      return decoded?.id || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/* ─────────────────────────────────────────
   GET SERVICE PROVIDERS (with filters)
   Mounted at /api/providers and /api/services/providers
───────────────────────────────────────── */
const getProvidersHandler = async (req, res) => {
  const { city, area, category } = req.query;
  try {
    let query = `
      SELECT 
        a.service_id,
        a.serviceprovider_id,
        a.serviceprovider_name,
        a.service_name,
        a.service_description,
        a.started_at,
        a.city,
        a.experience,
        a.category,
        COALESCE(p.phone, u.phone, '03479814741') as phone,
        COALESCE(p.call_number, p.phone, u.phone, '03479814741') as call_number,
        COALESCE(p.whatsapp_number, p.phone, u.phone, '03479814741') as whatsapp_number,
        COALESCE(p.profile_image, 'provider1.png') as profile_image
      FROM addservice a
      LEFT JOIN providerprofile p ON a.serviceprovider_id = p.provider_id
      LEFT JOIN users u ON a.serviceprovider_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (city && city !== 'All') {
      query += ' AND (a.city LIKE ? OR p.city LIKE ?)';
      params.push(`%${city}%`, `%${city}%`);
    }
    if (area && area !== 'All Areas') {
      query += ' AND (a.city LIKE ? OR p.city LIKE ?)';
      params.push(`%${area}%`, `%${area}%`);
    }
    if (category && category !== 'All Categories') {
      query += ' AND (a.category = ? OR a.service_name LIKE ?)';
      params.push(category, `%${category}%`);
    }

    query += ' ORDER BY a.service_id ASC LIMIT 100';

    const [rows] = await pool.query(query, params);

    let finalRows = rows;
    // Fallback to providerprofile if no services matched
    if (finalRows.length === 0 && (!category || category === 'All Categories')) {
      let pQuery = `SELECT * FROM providerprofile WHERE 1=1`;
      const pParams = [];
      if (city && city !== 'All') {
        pQuery += ' AND city LIKE ?';
        pParams.push(`%${city}%`);
      }
      if (area && area !== 'All Areas') {
        pQuery += ' AND city LIKE ?';
        pParams.push(`%${area}%`);
      }
      pQuery += ' LIMIT 50';
      const [pRows] = await pool.query(pQuery, pParams);
      finalRows = pRows.map(p => ({
        service_id: p.provider_id,
        serviceprovider_id: p.provider_id,
        serviceprovider_name: p.name,
        service_name: 'Master Craftsmanship & Decor',
        service_description: 'Certified interior and architectural decor specialist offering precision installation and consultations.',
        started_at: '35.00',
        city: p.city,
        experience: '5',
        category: category !== 'All Categories' ? category : 'Paint',
        phone: p.phone || '03479814741',
        call_number: p.call_number || p.phone || '03479814741',
        whatsapp_number: p.whatsapp_number || p.phone || '03479814741',
        profile_image: p.profile_image || 'provider1.png'
      }));
    }

    // Format for frontend Services.jsx
    const formatted = finalRows.map((r, idx) => {
      const cityParts = (r.city || 'Lahore - DHA').split(' - ');
      const cityName = cityParts[0] || 'Lahore';
      const areaName = cityParts[1] || 'All Areas';
      const cat = r.category || (r.service_name?.toLowerCase().includes('paint') ? 'Paint' : 'Tiles');
      const sId = r.service_id || idx + 1;
      const rateNum = parseFloat(r.started_at) || (30 + (sId % 20));

      return {
        id: sId,
        providerId: r.serviceprovider_id || sId,
        name: r.service_name?.replace(' Name', '') || `${r.serviceprovider_name} Services`,
        owner: r.serviceprovider_name || 'Master Craftsman',
        category: cat,
        badge: 'Verified Pro',
        city: cityName,
        area: areaName,
        experienceYears: r.experience || '5',
        rates: `Rs. ${rateNum.toFixed(0)}/sq ft`,
        rating: (4.6 + ((sId % 5) * 0.08)).toFixed(1),
        completedJobs: 25 + ((sId * 7) % 75),
        phone: r.call_number || r.phone || '03479814741',
        whatsapp: r.whatsapp_number || r.phone || '03479814741',
        bio: r.service_description || 'Professional architectural installation, surface preparation, and quality guaranteed craftsmanship.',
        profile_image: r.profile_image || `provider${(sId % 15) + 1}.png`,
        services: [r.service_name?.replace(' Name', '') || cat, 'Site Inspection', 'Warranty Backed']
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error('[GET /providers]', err);
    res.json({ success: true, count: 0, data: [] });
  }
};

router.get('/providers', getProvidersHandler);
router.get('/services/providers', getProvidersHandler);

/* ─────────────────────────────────────────
   BOOK A SERVICE VISIT
   Mounted at /api/book and /api/services/book
───────────────────────────────────────── */
const bookHandler = async (req, res) => {
  const { providerId, providerName, serviceCategory, customerName, phone, city, area, date, notes, userId, address } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Date is required for booking' });
  }

  const optionalUid = getOptionalUserId(req);
  const uid = optionalUid || parseInt(userId) || 0;
  const pId = parseInt(providerId) || 0;
  const sName = serviceCategory ? `${serviceCategory} - ${providerName || 'Service'}` : (providerName || 'General Service');
  const fullAddress = address || [
    customerName ? `Client: ${customerName}` : '',
    phone ? `Phone: ${phone}` : '',
    area ? `Area: ${area}` : '',
    city ? `City: ${city}` : '',
    notes ? `Notes: ${notes}` : ''
  ].filter(Boolean).join(' | ');

  try {
    const [result] = await pool.query(
      `INSERT INTO booking (user_id, provider_id, service_id, service_name, booking_date, address, status, created_at)
       VALUES (?, ?, 0, ?, ?, ?, 'Pending', NOW())`,
      [uid, pId, sName, date, fullAddress]
    );

    res.status(201).json({
      success: true,
      message: 'Service visit booked successfully! Our verified craftsman will contact you.',
      bookingId: result.insertId
    });
  } catch (err) {
    console.error('[POST /book]', err);
    res.status(500).json({ error: 'Server error booking service' });
  }
};

router.post('/book', bookHandler);
router.post('/services/book', bookHandler);

/* ─────────────────────────────────────────
   MY BOOKINGS (User Bookings)
───────────────────────────────────────── */
const getMyBookingsHandler = async (req, res) => {
  const optionalUid = getOptionalUserId(req);
  const uid = optionalUid || parseInt(req.params?.id) || 0;

  try {
    let query = `
      SELECT b.*, 
             COALESCE(p.name, 'Verified Pro') as provider_name,
             COALESCE(p.phone, '03479814741') as provider_phone,
             COALESCE(p.profile_image, 'provider1.png') as provider_image
      FROM booking b
      LEFT JOIN providerprofile p ON b.provider_id = p.provider_id
    `;
    const params = [];
    if (uid > 0) {
      query += ' WHERE b.user_id = ?';
      params.push(uid);
    }
    query += ' ORDER BY b.booking_id DESC';

    const [bookings] = await pool.query(query, params);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('[GET /my-bookings]', err);
    res.json({ success: true, count: 0, data: [] });
  }
};

router.get('/my-bookings', getMyBookingsHandler);
router.get('/bookings/user/:id', getMyBookingsHandler);

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  try {
    const fullMsg = phone ? `[Customer Phone: ${phone}]\n\n${message}` : message;
    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, subject || 'General Inquiry', fullMsg]
    ).catch(e => console.error('contact_messages insert note:', e.message));

    // Send email to admin
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#4b2c2c;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px;">
          <h2 style="color:#f5e6d0;margin:0;">🏠 New Contact Inquiry — Intra Decor</h2>
        </div>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f8f8f8;padding:14px;border-radius:8px;border-left:4px solid #4b2c2c;">${message}</div>
        <p style="color:#999;font-size:12px;margin-top:20px;">Submitted: ${new Date().toLocaleString()}</p>
      </div>`;

    const adminEmail = process.env.ADMIN_EMAIL || 'info.muzseo@gmail.com';
    sendEmail({
      to: adminEmail,
      subject: `Inquiry: ${subject || 'General'} — ${name}`,
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
      'INSERT IGNORE INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())',
      [email.toLowerCase().trim()]
    ).catch(e => console.error('newsletter insert note:', e.message));

    res.json({ success: true, message: 'Subscribed to newsletter successfully!' });
  } catch (err) {
    res.json({ success: true, message: 'Subscribed!' });
  }
});

/* ─────────────────────────────────────────
   FAVORITES / WISHLIST
   Supports both token auth and /favorites/:userId paths
───────────────────────────────────────── */
const getFavoritesHandler = async (req, res) => {
  const optionalUid = getOptionalUserId(req);
  const uid = optionalUid || parseInt(req.params?.userId) || (req.user ? req.user.id : null);
  if (!uid) {
    return res.json({ success: true, data: [] });
  }

  try {
    const [favs] = await pool.query(
      `SELECT f.id as fav_id, f.item_id as id, f.type, f.created_at,
              p.name, p.price, p.discount, p.product_image, p.category
       FROM favorites f
       LEFT JOIN productadd p ON f.item_id = p.id
       WHERE f.user_id = ?
       ORDER BY f.id DESC`,
      [uid]
    );
    res.json({ success: true, data: favs });
  } catch (err) {
    console.error('[GET /favorites]', err);
    res.json({ success: true, data: [] });
  }
};

const addFavoriteHandler = async (req, res) => {
  const optionalUid = getOptionalUserId(req);
  const uid = optionalUid || parseInt(req.params?.userId) || (req.user ? req.user.id : null);
  const productId = req.body?.productId || req.body?.product_id;

  if (!uid || !productId) {
    return res.status(400).json({ error: 'User ID and Product ID required' });
  }

  try {
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, item_id, type) VALUES (?, ?, ?)',
      [uid, productId, 'product']
    );
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    console.error('[POST /favorites]', err);
    res.status(500).json({ error: 'Server error adding to favorites' });
  }
};

const deleteFavoriteHandler = async (req, res) => {
  const optionalUid = getOptionalUserId(req);
  const uid = optionalUid || parseInt(req.params?.userId) || (req.user ? req.user.id : null);
  const productId = req.params?.productId;

  if (!uid || !productId) {
    return res.status(400).json({ error: 'User ID and Product ID required' });
  }

  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND item_id = ?',
      [uid, productId]
    );
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error('[DELETE /favorites]', err);
    res.status(500).json({ error: 'Server error removing from favorites' });
  }
};

router.get('/favorites', getFavoritesHandler);
router.get('/favorites/:userId', getFavoritesHandler);
router.post('/favorites', addFavoriteHandler);
router.post('/favorites/:userId', addFavoriteHandler);
router.delete('/favorites/:productId', deleteFavoriteHandler);
router.delete('/favorites/:userId/:productId', deleteFavoriteHandler);

export default router;

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, requireSeller } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router = express.Router();

// Multer — file upload setup
const uploadDir = path.resolve(__dirname, '../../client/public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/* ─────────────────────────────────────────
   GET ALL PRODUCTS (with filters)
   GET /api/products?category=tiles&search=xyz
───────────────────────────────────────── */
router.get('/', async (req, res) => {
  const { category, search, subcategory, limit = 20, page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query  = "SELECT * FROM productadd WHERE status = 'approved'";
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (subcategory) {
      query += ' AND product_type = ?';
      params.push(subcategory);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [products] = await pool.query(query, params);

    // Add calculated final price
    const data = products.map(p => ({
      ...p,
      finalPrice: p.price - (p.price * (p.discount || 0) / 100),
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('[GET /products]', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

/* ─────────────────────────────────────────
   GET SINGLE PRODUCT
───────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productadd WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const p = rows[0];
    const data = { ...p, finalPrice: p.price - (p.price * (p.discount || 0) / 100) };

    // Get reviews
    let reviews = [];
    try {
      const [reviewRows] = await pool.query(
        `SELECT pr.id, pr.rating, pr.feedback as comment, pr.created_at,
                COALESCE(u.name, 'Verified Customer') as userName
         FROM product_reviews pr
         LEFT JOIN users u ON pr.user_id = u.id
         WHERE pr.product_id = ?
         ORDER BY pr.created_at DESC`,
        [req.params.id]
      );
      reviews = reviewRows.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.userName,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'
      }));
    } catch (e) {
      reviews = [];
    }

    res.json({ success: true, data: { ...data, reviews } });
  } catch (err) {
    console.error('[GET /products/:id]', err);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

/* ─────────────────────────────────────────
   ADD PRODUCT (Seller)
───────────────────────────────────────── */
router.post('/', authenticateToken, requireSeller, upload.single('product_image'), async (req, res) => {
  const { name, price, discount, category, product_type, description, quantity } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price and category are required' });
  }

  try {
    const imageName = req.file ? req.file.filename : null;
    const sellerId  = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO productadd (name, price, discount, category, product_type, description, quantity, product_image, seller_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [name, parseFloat(price), parseFloat(discount || 0), category, product_type || '', description || '', parseInt(quantity || 1), imageName, sellerId]
    );

    res.status(201).json({ success: true, message: 'Product submitted for approval', data: { id: result.insertId } });
  } catch (err) {
    console.error('[POST /products]', err);
    res.status(500).json({ error: 'Server error adding product' });
  }
});

/* ─────────────────────────────────────────
   UPDATE PRODUCT (Seller - own products)
───────────────────────────────────────── */
router.put('/:id', authenticateToken, requireSeller, upload.single('product_image'), async (req, res) => {
  const { name, price, discount, category, product_type, description, quantity } = req.body;

  try {
    // Verify ownership
    const [rows] = await pool.query('SELECT * FROM productadd WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own products' });
    }

    const imageName = req.file ? req.file.filename : product.product_image;

    await pool.query(
      `UPDATE productadd SET name=?, price=?, discount=?, category=?, product_type=?, description=?, quantity=?, product_image=?
       WHERE id = ?`,
      [name || product.name, parseFloat(price || product.price), parseFloat(discount ?? product.discount),
       category || product.category, product_type || product.product_type,
       description || product.description, parseInt(quantity || product.quantity), imageName, req.params.id]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    console.error('[PUT /products/:id]', err);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

/* ─────────────────────────────────────────
   DELETE PRODUCT
───────────────────────────────────────── */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productadd WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await pool.query('DELETE FROM productadd WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[DELETE /products/:id]', err);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

/* ─────────────────────────────────────────
   GET PRODUCT REVIEWS
───────────────────────────────────────── */
router.get('/:id/reviews', async (req, res) => {
  try {
    const [reviewRows] = await pool.query(
      `SELECT pr.id, pr.rating, pr.feedback, pr.created_at,
              COALESCE(u.name, 'Verified Customer') as userName
       FROM product_reviews pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.product_id = ?
       ORDER BY pr.created_at DESC`,
      [req.params.id]
    );
    const reviews = reviewRows.map(r => {
      const match = r.feedback ? r.feedback.match(/^\[By (.+?)\]:\s*([\s\S]*)$/) : null;
      const reviewerName = match ? match[1] : (r.userName || 'Verified Customer');
      const cleanComment = match ? match[2] : (r.feedback || '');
      return {
        id: r.id,
        rating: r.rating,
        comment: cleanComment,
        userName: reviewerName,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'
      };
    });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error('[GET /products/:id/reviews]', err);
    res.json({ success: true, count: 0, data: [] });
  }
});

/* ─────────────────────────────────────────
   ADD REVIEW
───────────────────────────────────────── */
router.post('/:id/reviews', async (req, res) => {
  const { rating, comment, userName } = req.body;
  if (!comment || !rating) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  try {
    let userId = 0;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intradecor_jwt_secret_key_2026');
        userId = decoded.id || 0;
      } catch (e) {}
    }

    if (!userId || userId === 0) {
      const [u] = await pool.query('SELECT id FROM users LIMIT 1');
      userId = u.length > 0 ? u[0].id : 1;
    }

    const reviewerName = userName ? userName.trim() : 'Verified Customer';
    const storedFeedback = `[By ${reviewerName}]: ${comment.trim()}`;

    const [result] = await pool.query(
      'INSERT INTO product_reviews (product_id, user_id, rating, feedback, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.params.id, userId, parseInt(rating), storedFeedback]
    );

    const newRev = {
      id: result.insertId,
      product_id: req.params.id,
      userName: reviewerName,
      rating: parseInt(rating),
      comment: comment.trim(),
      date: 'Just now'
    };

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: newRev });
  } catch (err) {
    console.error('[POST /products/:id/reviews]', err);
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

export default router;

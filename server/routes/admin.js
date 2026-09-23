import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/* ─────────────────────────────────────────
   ADMIN STATS / DASHBOARD
───────────────────────────────────────── */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [[userCount]]    = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const [[sellerCount]]  = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'seller'");
    const [[productCount]] = await pool.query("SELECT COUNT(*) as count FROM productadd WHERE status = 'approved'");
    const [[pendingCount]] = await pool.query("SELECT COUNT(*) as count FROM productadd WHERE status = 'pending'");
    const [[orderCount]]   = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [[revenue]]      = await pool.query("SELECT SUM(amount) as total FROM orders WHERE status != 'cancelled'");

    res.json({
      success: true,
      data: {
        totalUsers:       userCount.count,
        totalSellers:     sellerCount.count,
        approvedProducts: productCount.count,
        pendingProducts:  pendingCount.count,
        totalOrders:      orderCount.count,
        totalRevenue:     revenue.total || 0,
      }
    });
  } catch (err) {
    console.error('[GET /admin/stats]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   ALL USERS
───────────────────────────────────────── */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, city, phone, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('[GET /admin/users]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('[DELETE /admin/users/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   PRODUCTS (Approve / Reject)
───────────────────────────────────────── */
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    let query  = `SELECT productadd.*, users.name as seller_name, users.email as seller_email
                  FROM productadd LEFT JOIN users ON productadd.seller_id = users.id`;
    const params = [];
    if (status) {
      query += ' WHERE productadd.status = ?';
      params.push(status);
    }
    query += ' ORDER BY productadd.id DESC';
    const [products] = await pool.query(query, params);
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('[GET /admin/products]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/products/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE productadd SET status = 'approved' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Product approved' });
  } catch (err) {
    console.error('[PUT /admin/products/:id/approve]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/products/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE productadd SET status = 'rejected' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Product rejected' });
  } catch (err) {
    console.error('[PUT /admin/products/:id/reject]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM productadd WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('[DELETE /admin/products/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   SELLERS (Approve / Block)
───────────────────────────────────────── */
router.get('/sellers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [sellers] = await pool.query(
      "SELECT id, name, email, city, phone, status, created_at FROM users WHERE role = 'seller' ORDER BY created_at DESC"
    );
    res.json({ success: true, data: sellers });
  } catch (err) {
    console.error('[GET /admin/sellers]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/sellers/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'approved' WHERE id = ? AND role = 'seller'", [req.params.id]);
    res.json({ success: true, message: 'Seller approved' });
  } catch (err) {
    console.error('[PUT /admin/sellers/:id/approve]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/sellers/:id/block', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'blocked' WHERE id = ? AND role = 'seller'", [req.params.id]);
    res.json({ success: true, message: 'Seller blocked' });
  } catch (err) {
    console.error('[PUT /admin/sellers/:id/block]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   SERVICE PROVIDERS (Approve)
───────────────────────────────────────── */
router.get('/providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [providers] = await pool.query(
      "SELECT id, name, email, city, phone, status, created_at FROM users WHERE role = 'service_provider' ORDER BY created_at DESC"
    );
    res.json({ success: true, data: providers });
  } catch (err) {
    console.error('[GET /admin/providers]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/providers/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'approved' WHERE id = ? AND role = 'service_provider'", [req.params.id]);
    res.json({ success: true, message: 'Provider approved' });
  } catch (err) {
    console.error('[PUT /admin/providers/:id/approve]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────── */
router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [notifs] = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    res.json({ success: true, data: notifs });
  } catch (err) {
    console.error('[GET /admin/notifications]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/notifications/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[PUT /admin/notifications/:id/read]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─────────────────────────────────────────
   CONTACT MESSAGES
───────────────────────────────────────── */
router.get('/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [msgs] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, data: msgs });
  } catch (err) {
    // Table might not exist, return empty
    res.json({ success: true, data: [] });
  }
});

export default router;

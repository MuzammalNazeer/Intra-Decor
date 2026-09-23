import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/* ─────────────────────────────────────────
   PLACE ORDER
   POST /api/orders/place
───────────────────────────────────────── */
router.post('/place', authenticateToken, async (req, res) => {
  const { name, phone, address, city, payment_method = 'cod' } = req.body;

  if (!name || !phone || !address || !city) {
    return res.status(400).json({ error: 'Please provide name, phone, address and city' });
  }

  try {
    // Get user's cart with product/seller info
    const [cartItems] = await pool.query(
      `SELECT cart.*, productadd.price, productadd.discount,
              productadd.quantity as stock, productadd.name as product_name,
              productadd.seller_id,
              users.email as seller_email, users.name as seller_name
       FROM cart
       JOIN productadd ON cart.product_id = productadd.id
       JOIN users ON productadd.seller_id = users.id
       WHERE cart.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    let grandTotal = 0;
    const placedOrders = [];

    for (const item of cartItems) {
      const finalPrice = item.price - (item.price * (item.discount || 0) / 100);
      const subtotal   = finalPrice * item.quantity;
      grandTotal += subtotal;

      // Insert order
      const [result] = await pool.query(
        `INSERT INTO orders (user_id, product_id, quantity, amount, name, phone, address, city, payment_method, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [req.user.id, item.product_id, item.quantity, subtotal, name, phone, address, city, payment_method]
      );

      placedOrders.push({
        orderId: result.insertId,
        productName: item.product_name,
        quantity: item.quantity,
        amount: subtotal,
      });

      // Decrease product stock
      await pool.query(
        'UPDATE productadd SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      // Send email to seller
      if (item.seller_email) {
        const sellerHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
            <div style="background:#4b2c2c;padding:20px;text-align:center;">
              <h2 style="color:white;margin:0;">🛒 New Order — Intra Decor</h2>
            </div>
            <div style="padding:24px;">
              <p>Hello <strong>${item.seller_name}</strong>,</p>
              <p>You have a new order!</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Product</td><td style="padding:8px;">${item.product_name}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Quantity</td><td style="padding:8px;">${item.quantity}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Amount</td><td style="padding:8px;">Rs. ${subtotal.toFixed(0)}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Customer</td><td style="padding:8px;">${name}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Phone</td><td style="padding:8px;">${phone}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Address</td><td style="padding:8px;">${address}, ${city}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Payment</td><td style="padding:8px;">${payment_method.toUpperCase()}</td></tr>
              </table>
            </div>
          </div>`;
        sendEmail({ to: item.seller_email, subject: `New Order — ${item.product_name}`, html: sellerHtml, text: `New order for ${item.product_name}` }).catch(() => {});
      }
    }

    // Send confirmation to buyer
    const userHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        <div style="background:#4b2c2c;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">✅ Order Confirmed!</h2>
        </div>
        <div style="padding:24px;">
          <p>Hello <strong>${name}</strong>, your order has been placed successfully!</p>
          <p><strong>Total: Rs. ${grandTotal.toFixed(0)}</strong></p>
          <p>Payment: ${payment_method.toUpperCase()}</p>
          <p>We will notify you when your order is shipped.</p>
        </div>
        <div style="background:#f7f0eb;padding:14px;text-align:center;">
          <p style="color:#a08060;font-size:12px;margin:0;">© ${new Date().getFullYear()} Intra Decor Home</p>
        </div>
      </div>`;

    const [userRow] = await pool.query('SELECT email FROM users WHERE id = ?', [req.user.id]);
    if (userRow.length > 0) {
      sendEmail({ to: userRow[0].email, subject: 'Order Confirmed — Intra Decor Home', html: userHtml, text: `Order confirmed. Total: Rs. ${grandTotal.toFixed(0)}` }).catch(() => {});
    }

    // Clear cart
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orders: placedOrders,
      grandTotal,
    });
  } catch (err) {
    console.error('[POST /orders/place]', err);
    res.status(500).json({ error: 'Server error placing order' });
  }
});

/* ─────────────────────────────────────────
   MY ORDERS (User)
───────────────────────────────────────── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT orders.*, productadd.name as product_name, productadd.product_image
       FROM orders
       JOIN productadd ON orders.product_id = productadd.id
       WHERE orders.user_id = ?
       ORDER BY orders.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[GET /orders/my]', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

/* ─────────────────────────────────────────
   TRACK ORDER (by order ID or phone)
───────────────────────────────────────── */
router.get('/track/:query', async (req, res) => {
  const query = req.params.query;
  try {
    let rows;
    // Try by order ID first
    [rows] = await pool.query(
      `SELECT orders.*, productadd.name as product_name, productadd.product_image
       FROM orders JOIN productadd ON orders.product_id = productadd.id
       WHERE orders.id = ?`,
      [query]
    );

    // If not found by ID, try by phone
    if (rows.length === 0) {
      [rows] = await pool.query(
        `SELECT orders.*, productadd.name as product_name, productadd.product_image
         FROM orders JOIN productadd ON orders.product_id = productadd.id
         WHERE orders.phone = ?
         ORDER BY orders.created_at DESC LIMIT 10`,
        [query]
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No order found with this ID or phone number' });
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[GET /orders/track]', err);
    res.status(500).json({ error: 'Server error tracking order' });
  }
});

/* ─────────────────────────────────────────
   SELLER ORDERS
───────────────────────────────────────── */
router.get('/seller', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seller access required' });
  }
  try {
    const [orders] = await pool.query(
      `SELECT orders.*, productadd.name as product_name, productadd.product_image,
              users.name as customer_name, users.email as customer_email
       FROM orders
       JOIN productadd ON orders.product_id = productadd.id
       JOIN users ON orders.user_id = users.id
       WHERE productadd.seller_id = ?
       ORDER BY orders.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[GET /orders/seller]', err);
    res.status(500).json({ error: 'Server error fetching seller orders' });
  }
});

/* ─────────────────────────────────────────
   UPDATE ORDER STATUS (Seller/Admin)
───────────────────────────────────────── */
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Valid: ' + validStatuses.join(', ') });
  }

  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('[PUT /orders/:id/status]', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

/* ─────────────────────────────────────────
   ADMIN — ALL ORDERS
───────────────────────────────────────── */
router.get('/admin/all', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const [orders] = await pool.query(
      `SELECT orders.*, productadd.name as product_name, productadd.product_image,
              users.name as customer_name, users.email as customer_email
       FROM orders
       JOIN productadd ON orders.product_id = productadd.id
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC`
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[GET /orders/admin/all]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

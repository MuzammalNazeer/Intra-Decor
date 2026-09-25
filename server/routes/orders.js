import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

const placeOrderHandler = async (req, res) => {
  const rawName = req.body.name || req.body.customerName;
  const rawEmail = req.body.email;
  const rawPhone = req.body.phone;
  const rawAddress = req.body.address;
  const rawCity = req.body.city;
  const rawMethod = req.body.payment_method || req.body.paymentMethod || 'cod';

  const name = rawName?.trim();
  const email = rawEmail?.trim();
  const phone = rawPhone?.trim();
  const address = rawAddress?.trim();
  const city = rawCity?.trim();
  const paymentMethod = String(rawMethod).toLowerCase().includes('safe') ? 'safepay' : 'cod';

  if (!name || !phone || !address || !city) {
    return res.status(400).json({ error: 'Please provide name, phone, address and city' });
  }

  try {
    // 1. Resolve valid user_id (logged-in or mapped/guest user)
    let userId = req.user?.id;
    if (!userId) {
      if (email || phone) {
        const [foundUsers] = await pool.query(
          'SELECT id FROM users WHERE email = ? OR (phone = ? AND phone != "") LIMIT 1',
          [email || 'no-email', phone || 'no-phone']
        );
        if (foundUsers.length > 0) {
          userId = foundUsers[0].id;
        }
      }

      if (!userId) {
        const guestEmail = email || `customer_${Date.now()}@intradecor.local`;
        const [createdUser] = await pool.query(
          'INSERT INTO users (name, email, password, role, city, phone) VALUES (?, ?, "guest_checkout", "customer", ?, ?)',
          [name, guestEmail, city, phone]
        );
        userId = createdUser.insertId;
      }
    }

    // 2. Resolve order items: first check items sent from frontend cart, otherwise check MySQL cart table
    let orderItems = [];
    const clientItems = req.body.items || req.body.cartItems;

    if (Array.isArray(clientItems) && clientItems.length > 0) {
      for (const item of clientItems) {
        const pId = Number(item.productId || item.product_id || item.id);
        const qty = Math.max(1, parseInt(item.quantity) || 1);

        if (pId) {
          const [pRows] = await pool.query(
            `SELECT productadd.*, users.email as seller_email, users.name as seller_name
             FROM productadd
             LEFT JOIN users ON productadd.seller_id = users.id
             WHERE productadd.id = ?`,
            [pId]
          );

          if (pRows.length > 0) {
            const prod = pRows[0];
            const price = Number(prod.price) || 0;
            const discount = Number(prod.discount || 0);
            const finalPrice = Math.max(0, price - (price * discount / 100));
            orderItems.push({
              product_id: prod.id,
              product_name: prod.name,
              price,
              discount,
              finalPrice,
              quantity: qty,
              seller_email: prod.seller_email,
              seller_name: prod.seller_name,
            });
            continue;
          }
        }

        // Fallback for custom configured decor item
        const fallbackPrice = Number(item.finalPrice || item.price || 0);
        orderItems.push({
          product_id: pId || 245,
          product_name: item.name || item.product_name || 'Intra Decor Product',
          price: fallbackPrice,
          discount: 0,
          finalPrice: fallbackPrice,
          quantity: qty,
          seller_email: null,
          seller_name: null,
        });
      }
    } else if (userId) {
      // Query cart table
      const [dbCart] = await pool.query(
        `SELECT cart.*, productadd.price, productadd.discount,
                productadd.quantity as stock, productadd.name as product_name,
                productadd.seller_id,
                users.email as seller_email, users.name as seller_name
         FROM cart
         JOIN productadd ON cart.product_id = productadd.id
         LEFT JOIN users ON productadd.seller_id = users.id
         WHERE cart.user_id = ?`,
        [userId]
      );

      for (const row of dbCart) {
        const price = Number(row.price) || 0;
        const discount = Number(row.discount || 0);
        const finalPrice = Math.max(0, price - (price * discount / 100));
        orderItems.push({
          product_id: row.product_id,
          product_name: row.product_name,
          price,
          discount,
          finalPrice,
          quantity: Number(row.quantity) || 1,
          seller_email: row.seller_email,
          seller_name: row.seller_name,
        });
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const trackingNumber = `INTRA-${Date.now()}`;
    let grandTotal = 0;
    const placedOrders = [];

    // 3. Insert each item into orders table
    for (const item of orderItems) {
      const subtotal = item.finalPrice * item.quantity;
      grandTotal += subtotal;

      const [result] = await pool.query(
        `INSERT INTO orders (user_id, product_id, quantity, amount, name, phone, address, city, payment_method, payment_status, transaction_ref, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          item.product_id,
          item.quantity,
          subtotal,
          name,
          phone,
          address,
          city,
          paymentMethod,
          paymentMethod === 'safepay' ? 'paid' : 'unpaid',
          trackingNumber,
          paymentMethod === 'safepay' ? 'processing' : 'pending'
        ]
      );

      placedOrders.push({
        orderId: result.insertId,
        productName: item.product_name,
        quantity: item.quantity,
        amount: subtotal,
      });

      // Decrease product stock safely
      await pool.query(
        'UPDATE productadd SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
        [item.quantity, item.product_id]
      ).catch(() => {});

      // Send email to seller if available
      if (item.seller_email) {
        const sellerHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
            <div style="background:#4b2c2c;padding:20px;text-align:center;">
              <h2 style="color:white;margin:0;">🛒 New Order — Intra Decor</h2>
            </div>
            <div style="padding:24px;">
              <p>Hello <strong>${item.seller_name || 'Seller'}</strong>,</p>
              <p>You have received a new order (${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Safepay Paid'})!</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Product</td><td style="padding:8px;">${item.product_name}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Quantity</td><td style="padding:8px;">${item.quantity}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Amount</td><td style="padding:8px;">Rs. ${subtotal.toLocaleString()}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Customer</td><td style="padding:8px;">${name}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Phone</td><td style="padding:8px;">${phone}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Address</td><td style="padding:8px;">${address}, ${city}</td></tr>
                <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Payment</td><td style="padding:8px;">${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Safepay Paid'}</td></tr>
              </table>
            </div>
          </div>`;
        sendEmail({ to: item.seller_email, subject: `New Order — ${item.product_name}`, html: sellerHtml, text: `New order for ${item.product_name}` }).catch(() => {});
      }
    }

    // 4. Send email to customer
    const userEmail = email || (req.user ? (await pool.query('SELECT email FROM users WHERE id = ?', [userId]))[0]?.[0]?.email : null);
    if (userEmail) {
      const userHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
          <div style="background:#4b2c2c;padding:20px;text-align:center;">
            <h2 style="color:white;margin:0;">✅ Order Confirmed!</h2>
          </div>
          <div style="padding:24px;">
            <p>Hello <strong>${name}</strong>, your order has been placed successfully!</p>
            <p><strong>Tracking Number: ${trackingNumber}</strong></p>
            <p><strong>Total: Rs. ${grandTotal.toLocaleString()}</strong></p>
            <p>Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Safepay'}</p>
            <p>Delivery Address: ${address}, ${city}</p>
            <p>We will dispatch your order and keep you updated.</p>
          </div>
          <div style="background:#f7f0eb;padding:14px;text-align:center;">
            <p style="color:#a08060;font-size:12px;margin:0;">© ${new Date().getFullYear()} Intra Decor Home</p>
          </div>
        </div>`;

      sendEmail({ to: userEmail, subject: 'Order Confirmed — Intra Decor Home', html: userHtml, text: `Order confirmed. Tracking: ${trackingNumber}. Total: Rs. ${grandTotal.toLocaleString()}` }).catch(() => {});
    }

    // 5. Clear MySQL cart if user exists
    if (userId) {
      await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]).catch(() => {});
    }

    const responseOrder = {
      id: placedOrders[0]?.orderId || Date.now(),
      trackingNumber,
      customerName: name,
      phone,
      email: userEmail || '',
      address,
      city,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Safepay',
      grandTotal,
      orders: placedOrders,
      message: 'Order placed successfully!'
    };

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: responseOrder,
      order: responseOrder,
      orders: placedOrders,
      grandTotal,
      trackingNumber,
      id: responseOrder.id,
    });
  } catch (err) {
    console.error('[POST /orders/place]', err);
    res.status(500).json({ error: 'Server error placing order: ' + err.message });
  }
};

/* ─────────────────────────────────────────
   POST /api/orders/place
───────────────────────────────────────── */
router.post('/place', optionalAuth, placeOrderHandler);

/* ─────────────────────────────────────────
   POST /api/orders (compatibility alias)
───────────────────────────────────────── */
router.post('/', optionalAuth, placeOrderHandler);

/* ─────────────────────────────────────────
   MY ORDERS (User)
───────────────────────────────────────── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT orders.*,
              COALESCE(productadd.name, 'Intra Decor Product') as product_name,
              productadd.product_image
       FROM orders
       LEFT JOIN productadd ON orders.product_id = productadd.id
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
   USER ORDERS (legacy alias)
───────────────────────────────────────── */
router.get('/user/:id', authenticateToken, async (req, res) => {
  if (req.user.id.toString() !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only view your own orders' });
  }

  try {
    const [orders] = await pool.query(
      `SELECT orders.*,
              COALESCE(productadd.name, 'Intra Decor Product') as product_name,
              productadd.product_image
       FROM orders
       LEFT JOIN productadd ON orders.product_id = productadd.id
       WHERE orders.user_id = ?
       ORDER BY orders.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[GET /orders/user/:id]', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

/* ─────────────────────────────────────────
   TRACK ORDER (by order ID or phone)
───────────────────────────────────────── */
router.get('/track/:query', async (req, res) => {
  const query = req.params.query?.trim();
  if (!query) {
    return res.status(400).json({ error: 'Please provide a valid tracking number, order ID, or phone number' });
  }

  try {
    let rows;
    // 1. Try by tracking code / transaction_ref
    [rows] = await pool.query(
      `SELECT orders.*, productadd.name as product_name, productadd.product_image
       FROM orders JOIN productadd ON orders.product_id = productadd.id
       WHERE orders.transaction_ref = ? OR orders.id = ?`,
      [query, isNaN(Number(query)) ? -1 : Number(query)]
    );

    // 2. If not found, try by phone number
    if (rows.length === 0) {
      [rows] = await pool.query(
        `SELECT orders.*, productadd.name as product_name, productadd.product_image
         FROM orders JOIN productadd ON orders.product_id = productadd.id
         WHERE orders.phone = ?
         ORDER BY orders.created_at DESC LIMIT 20`,
        [query]
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No order found with tracking code, order ID, or phone number: ' + query });
    }

    const first = rows[0];
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const trackingCode = first.transaction_ref || `INTRA-${first.id}`;

    const formattedOrder = {
      id: first.id,
      trackingNumber: trackingCode,
      status: (first.status || 'Processing').toUpperCase(),
      createdAt: first.created_at,
      customerName: first.name,
      phone: first.phone,
      address: first.address,
      city: first.city,
      paymentMethod: first.payment_method === 'safepay' ? 'Safepay' : 'Cash on Delivery',
      paymentStatus: first.payment_status,
      grandTotal: totalAmount,
      items: rows.map(r => ({
        name: r.product_name,
        quantity: r.quantity,
        total: Number(r.amount),
        image: r.product_image,
      })),
      timeline: [
        {
          title: 'Order Confirmed & Placed',
          time: new Date(first.created_at).toLocaleString(),
          done: true
        },
        {
          title: first.payment_method === 'safepay' ? 'Safepay Payment Verified' : 'COD Payment on Delivery Scheduled',
          time: first.payment_status === 'paid' ? 'Completed' : 'Awaiting Delivery',
          done: first.payment_status === 'paid' || ['paid', 'processing', 'shipped', 'delivered'].includes(first.status)
        },
        {
          title: 'Parcel Dispatched & In Transit',
          time: ['shipped', 'delivered'].includes(first.status) ? 'On the Way' : 'In Preparation',
          done: ['shipped', 'delivered'].includes(first.status)
        },
        {
          title: 'Package Delivered',
          time: first.status === 'delivered' ? 'Completed' : 'Final Step',
          done: first.status === 'delivered'
        },
      ]
    };

    res.json({ success: true, data: formattedOrder, rows });
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

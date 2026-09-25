import express from 'express';
import pool from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();
const safepaySessions = new Map();

// Helper to resolve items from client or DB
const resolveOrderItems = async (userId, clientItems) => {
  const resolved = [];

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
          resolved.push({
            product_id: prod.id,
            product_name: prod.name,
            price,
            discount,
            finalPrice,
            quantity: qty,
            seller_email: prod.seller_email,
            seller_name: prod.seller_name,
            image: prod.product_image,
          });
          continue;
        }
      }

      // Fallback
      const fallbackPrice = Number(item.finalPrice || item.price || 0);
      resolved.push({
        product_id: pId || 245,
        product_name: item.name || item.product_name || 'Intra Decor Product',
        price: fallbackPrice,
        discount: 0,
        finalPrice: fallbackPrice,
        quantity: qty,
        seller_email: null,
        seller_name: null,
        image: item.image || null,
      });
    }
  } else if (userId) {
    const [dbCart] = await pool.query(
      `SELECT cart.*, productadd.price, productadd.discount,
              productadd.quantity as stock, productadd.name as product_name,
              productadd.product_image,
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
      resolved.push({
        product_id: row.product_id,
        product_name: row.product_name,
        price,
        discount,
        finalPrice,
        quantity: Number(row.quantity) || 1,
        seller_email: row.seller_email,
        seller_name: row.seller_name,
        image: row.product_image,
      });
    }
  }

  return resolved;
};

const finalizeSafepayOrder = async (session) => {
  const { userId, name, email, phone, address, city, items, tracker, grandTotal } = session;

  if (!items || !items.length) {
    throw new Error('No items found in payment session');
  }

  const orderData = {
    id: Date.now(),
    trackingNumber: tracker,
    customerName: name,
    email: email || '',
    phone,
    address,
    city,
    paymentMethod: 'Safepay',
    grandTotal: grandTotal || items.reduce((s, it) => s + (it.finalPrice * it.quantity), 0),
    orders: [],
  };

  for (const item of items) {
    const subtotal = item.finalPrice * item.quantity;

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, amount, name, phone, address, city, payment_method, payment_status, transaction_ref, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'safepay', 'paid', ?, 'processing', NOW())`,
      [userId, item.product_id, item.quantity, subtotal, name, phone, address, city, tracker]
    );

    orderData.orders.push({
      orderId: result.insertId,
      productName: item.product_name,
      quantity: item.quantity,
      amount: subtotal,
    });

    // Update stock safely
    await pool.query(
      'UPDATE productadd SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
      [item.quantity, item.product_id]
    ).catch(() => {});

    // Notify seller
    if (item.seller_email) {
      const sellerHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
          <div style="background:#4b2c2c;padding:20px;text-align:center;">
            <h2 style="color:white;margin:0;">💳 Safepay Order Verified — Intra Decor</h2>
          </div>
          <div style="padding:24px;">
            <p>Hello <strong>${item.seller_name || 'Seller'}</strong>,</p>
            <p>A customer has completed payment via <strong>Safepay</strong> for your item.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Product</td><td style="padding:8px;">${item.product_name}</td></tr>
              <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Quantity</td><td style="padding:8px;">${item.quantity}</td></tr>
              <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Amount</td><td style="padding:8px;">Rs. ${subtotal.toLocaleString()}</td></tr>
              <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Customer</td><td style="padding:8px;">${name}</td></tr>
              <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;">Tracking Code</td><td style="padding:8px;">${tracker}</td></tr>
            </table>
          </div>
        </div>`;

      sendEmail({ to: item.seller_email, subject: `Safepay Order — ${item.product_name}`, html: sellerHtml, text: `Safepay order for ${item.product_name}` }).catch(() => {});
    }
  }

  // Update payments table record
  await pool.query(
    'UPDATE payments SET status = "completed", updated_at = NOW() WHERE tracker_token = ?',
    [tracker]
  ).catch(() => {});

  // Clear DB cart if user is logged in
  if (userId) {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]).catch(() => {});
  }

  // Send confirmation to customer
  const customerEmail = email || (userId ? (await pool.query('SELECT email FROM users WHERE id = ?', [userId]))[0]?.[0]?.email : null);
  if (customerEmail) {
    const userHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        <div style="background:#4b2c2c;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">✅ Safepay Payment Confirmed!</h2>
        </div>
        <div style="padding:24px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your payment via Safepay has been verified and your order is confirmed!</p>
          <p><strong>Tracking Number: ${tracker}</strong></p>
          <p><strong>Total Paid: Rs. ${orderData.grandTotal.toLocaleString()}</strong></p>
          <p>Delivery Address: ${address}, ${city}</p>
          <p>We are preparing your package for shipping.</p>
        </div>
        <div style="background:#f7f0eb;padding:14px;text-align:center;">
          <p style="color:#a08060;font-size:12px;margin:0;">© ${new Date().getFullYear()} Intra Decor Home</p>
        </div>
      </div>`;

    sendEmail({ to: customerEmail, subject: 'Safepay Payment Confirmed — Intra Decor Home', html: userHtml, text: `Payment confirmed for ${tracker}` }).catch(() => {});
  }

  orderData.id = orderData.orders[0]?.orderId || Date.now();
  return orderData;
};

/* ─────────────────────────────────────────
   POST /api/payments/safepay/create-session
───────────────────────────────────────── */
router.post('/safepay/create-session', optionalAuth, async (req, res) => {
  const { name, phone, email, address, city, items } = req.body;

  if (!name || !phone || !address || !city) {
    return res.status(400).json({ error: 'Please provide name, phone, address and city' });
  }

  try {
    // 1. Resolve user ID
    let userId = req.user?.id;
    if (!userId) {
      if (email || phone) {
        const [found] = await pool.query(
          'SELECT id FROM users WHERE email = ? OR (phone = ? AND phone != "") LIMIT 1',
          [email || 'no-email', phone || 'no-phone']
        );
        if (found.length > 0) userId = found[0].id;
      }
      if (!userId) {
        const [created] = await pool.query(
          'INSERT INTO users (name, email, password, role, city, phone) VALUES (?, ?, "guest_safepay", "customer", ?, ?)',
          [name, email || `safepay_${Date.now()}@intradecor.local`, city, phone]
        );
        userId = created.insertId;
      }
    }

    // 2. Resolve items
    const orderItems = await resolveOrderItems(userId, items);
    if (!orderItems.length) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const itemsSubtotal = orderItems.reduce((sum, it) => sum + (it.finalPrice * it.quantity), 0);
    const shipping = itemsSubtotal > 15000 || itemsSubtotal === 0 ? 0 : 500;
    const sessionTotal = Number(req.body.grandTotal) || (itemsSubtotal + shipping);

    const tracker = `SP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const session = {
      tracker,
      userId,
      name,
      email: email || '',
      phone,
      address,
      city,
      paymentMethod: 'safepay',
      amount: sessionTotal,
      grandTotal: sessionTotal,
      subtotal: itemsSubtotal,
      shipping,
      items: orderItems,
      status: 'pending',
      createdAt: Date.now(),
    };

    safepaySessions.set(tracker, session);

    // Record in MySQL payments table
    await pool.query(
      `INSERT INTO payments (user_id, tracker_token, amount, currency, status, raw_response, created_at)
       VALUES (?, ?, ?, 'PKR', 'initiated', ?, NOW())`,
      [userId, tracker, sessionTotal, JSON.stringify({ name, phone, city, itemCount: orderItems.length })]
    ).catch(err => console.error('[payments insert error]', err.message));

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:4173';
    let checkoutUrl = `${frontendBase}/payment/safepay?tracker=${tracker}`;

    // If real Safepay API credentials are provided, attempt real Safepay checkout session init
    const safepayKey = process.env.SAFEPAY_API_KEY;
    if (safepayKey && safepayKey.trim() !== '') {
      try {
        const isProd = process.env.SAFEPAY_ENV === 'production';
        const safepayHost = isProd ? 'https://api.getsafepay.com' : 'https://sandbox.api.getsafepay.com';
        const response = await fetch(`${safepayHost}/order/v1/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: safepayKey,
            amount: sessionTotal,
            currency: 'PKR',
            environment: isProd ? 'production' : 'sandbox',
          }),
        });
        const spData = await response.json();
        if (spData && spData.data && spData.data.token) {
          session.safepayToken = spData.data.token;
          checkoutUrl = `${safepayHost}/components?env=${isProd ? 'production' : 'sandbox'}&beacon=${spData.data.token}`;
        }
      } catch (safepayErr) {
        console.warn('[Safepay Gateway Init Warning, falling back to simulated portal]:', safepayErr.message);
      }
    }

    return res.json({
      success: true,
      data: {
        tracker,
        sessionId: tracker,
        amount: sessionTotal,
        checkoutUrl,
      },
    });
  } catch (err) {
    console.error('[POST /payments/safepay/create-session]', err);
    return res.status(500).json({ error: 'Failed to create Safepay session: ' + err.message });
  }
});

/* ─────────────────────────────────────────
   GET /api/payments/safepay/session/:tracker
───────────────────────────────────────── */
router.get('/safepay/session/:tracker', optionalAuth, async (req, res) => {
  const { tracker } = req.params;
  if (!tracker) return res.status(400).json({ error: 'Missing tracker' });

  const session = safepaySessions.get(tracker);
  if (!session) {
    // Try to check database payments table
    try {
      const [pRows] = await pool.query('SELECT * FROM payments WHERE tracker_token = ?', [tracker]);
      if (pRows.length > 0) {
        return res.json({
          success: true,
          data: {
            tracker,
            amount: Number(pRows[0].amount),
            currency: pRows[0].currency,
            status: pRows[0].status,
          }
        });
      }
    } catch {}
    return res.status(404).json({ error: 'Safepay session not found' });
  }

  return res.json({
    success: true,
    data: {
      tracker: session.tracker,
      amount: session.amount,
      grandTotal: session.grandTotal,
      subtotal: session.subtotal,
      shipping: session.shipping,
      customerName: session.name,
      email: session.email,
      phone: session.phone,
      address: session.address,
      city: session.city,
      items: session.items,
      status: session.status,
    },
  });
});

/* ─────────────────────────────────────────
   POST /api/payments/safepay/confirm
───────────────────────────────────────── */
router.post('/safepay/confirm', optionalAuth, async (req, res) => {
  const { tracker } = req.body;

  if (!tracker) {
    return res.status(400).json({ error: 'Missing payment tracker' });
  }

  const session = safepaySessions.get(tracker);
  if (!session) {
    return res.status(404).json({ error: 'Safepay session expired or not found' });
  }

  if (session.status === 'paid' && session.orderData) {
    return res.json({ success: true, data: session.orderData });
  }

  try {
    session.status = 'paid';
    const orderData = await finalizeSafepayOrder(session);
    session.orderData = orderData;
    safepaySessions.set(tracker, session);

    return res.json({ success: true, data: orderData, order: orderData });
  } catch (err) {
    console.error('[POST /payments/safepay/confirm]', err);
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

export default router;

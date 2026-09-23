import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/* ─────────────────────────────────────────
   GET CART
───────────────────────────────────────── */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT cart.id, cart.product_id, cart.quantity,
              productadd.name, productadd.price, productadd.discount,
              productadd.product_image, productadd.category, productadd.product_type,
              productadd.quantity as stock
       FROM cart
       JOIN productadd ON cart.product_id = productadd.id
       WHERE cart.user_id = ?`,
      [req.user.id]
    );

    const data = items.map(item => ({
      ...item,
      finalPrice: item.price - (item.price * (item.discount || 0) / 100),
      subtotal: (item.price - (item.price * (item.discount || 0) / 100)) * item.quantity,
    }));

    const total = data.reduce((sum, i) => sum + i.subtotal, 0);

    res.json({ success: true, data, total, count: data.length });
  } catch (err) {
    console.error('[GET /cart]', err);
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

/* ─────────────────────────────────────────
   ADD TO CART
───────────────────────────────────────── */
router.post('/add', authenticateToken, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

  try {
    // Check product exists and is approved
    const [products] = await pool.query("SELECT * FROM productadd WHERE id = ? AND status = 'approved'", [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found or not available' });
    }

    // Check if already in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [parseInt(quantity), req.user.id, product_id]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, parseInt(quantity)]
      );
    }

    // Get updated cart count
    const [countRow] = await pool.query(
      'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Added to cart', cartCount: countRow[0].total || 0 });
  } catch (err) {
    console.error('[POST /cart/add]', err);
    res.status(500).json({ error: 'Server error adding to cart' });
  }
});

/* ─────────────────────────────────────────
   UPDATE CART ITEM QUANTITY
───────────────────────────────────────── */
router.put('/update', authenticateToken, async (req, res) => {
  const { cart_id, quantity } = req.body;
  if (!cart_id || !quantity) {
    return res.status(400).json({ error: 'Cart ID and quantity are required' });
  }

  try {
    if (parseInt(quantity) <= 0) {
      await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cart_id, req.user.id]);
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [parseInt(quantity), cart_id, req.user.id]
    );

    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    console.error('[PUT /cart/update]', err);
    res.status(500).json({ error: 'Server error updating cart' });
  }
});

/* ─────────────────────────────────────────
   REMOVE FROM CART
───────────────────────────────────────── */
router.delete('/remove/:cartId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.cartId, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('[DELETE /cart/remove]', err);
    res.status(500).json({ error: 'Server error removing from cart' });
  }
});

/* ─────────────────────────────────────────
   CLEAR CART
───────────────────────────────────────── */
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('[DELETE /cart/clear]', err);
    res.status(500).json({ error: 'Server error clearing cart' });
  }
});

export default router;

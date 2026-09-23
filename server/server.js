import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Database connection (auto-connects on import)
import './config/db.js';

// Route handlers
import authRouter     from './routes/auth.js';
import productsRouter from './routes/products.js';
import cartRouter     from './routes/cart.js';
import ordersRouter   from './routes/orders.js';
import adminRouter    from './routes/admin.js';
import generalRouter  from './routes/general.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5050;

// ─── CORS ───────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5180',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES ──────────────────────────────────────
// Serve images and uploads from the original htdocs folder
const htdocsPath = path.resolve(__dirname, '../../htdocs');
app.use('/assets/images', express.static(path.join(htdocsPath, 'assets', 'images')));
app.use('/assets/css',    express.static(path.join(htdocsPath, 'assets', 'css')));
app.use('/uploads',       express.static(path.join(htdocsPath, 'uploads')));

// ─── API ROUTES ─────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart',     cartRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/admin',    adminRouter);
app.use('/api',          generalRouter);  // general: services, contact, newsletter, favorites

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'online',
    platform:  'Intra Decor Fullstack API',
    version:   '2.0.0',
    database:  'MySQL (real)',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── ERROR HANDLER ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── START SERVER ───────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log(`║  🏠 Intra Decor — Node.js + Express API    ║`);
  console.log(`║  🚀 Running on http://localhost:${PORT}        ║`);
  console.log(`║  📡 API: http://localhost:${PORT}/api          ║`);
  console.log(`║  🗄️  Database: MySQL (${process.env.DB_NAME || 'intradecorhome'})     ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});

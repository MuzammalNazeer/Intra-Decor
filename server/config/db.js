import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'root123',
  database: process.env.DB_NAME     || 'if0_42479335_intradecorhome',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+05:00',
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MySQL connected: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.log('💡 Make sure XAMPP/MySQL is running and db credentials are correct in .env');
  }
})();

export default pool;

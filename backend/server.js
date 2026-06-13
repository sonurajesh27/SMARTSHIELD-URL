require('dotenv').config();
const dns = require('dns');
// Set DNS servers to Google and Cloudflare to resolve querySrv ECONNREFUSED errors for MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import routes & controllers
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { redirectUrl } = require('./controllers/urlController');

// Rate limiters
const {
  authLimiter,
  urlCreateLimiter,
  generalApiLimiter,
  redirectLimiter
} = require('./middleware/rateLimitMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Request Logger ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'} - IP: ${req.ip}`);
  next();
});

// ─── Security Headers ────────────────────────────────────────────────────────
// Set basic security-relevant HTTP headers manually (no helmet dependency needed)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  next();
});

// ─── CORS ────────────────────────────────────────────────────────────────────
// Lock down to the known frontend origins. Falls back to localhost for local dev.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS Rejected: Origin "${origin}" is not in allowedOrigins:`, allowedOrigins);
        callback(new Error(`CORS policy: origin ${origin} is not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Cap body size at 50 kb to prevent large-payload attacks
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ─── Global API Rate Limiter ──────────────────────────────────────────────────
app.use('/api', generalApiLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
// Auth routes get the tighter brute-force limiter
app.use('/api/auth', authLimiter, authRoutes);

// URL creation gets its own limiter; other URL routes use the general limiter
app.use('/api/url', urlRoutes);

app.use('/api/analytics', analyticsRoutes);

// ─── Redirect Route ───────────────────────────────────────────────────────────
// Mounted after API routes to prevent intercepting /api endpoints
app.get('/:shortCode', redirectLimiter, redirectUrl);

// ─── Root Health Check ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const { getStatus } = require('./config/db');
  const dbStatus = getStatus();
  res.json({
    message: 'Welcome to the SmartShield URL Protection Backend API',
    status: dbStatus.connected ? 'healthy' : 'unhealthy',
    database: {
      connected: dbStatus.connected,
      readyState: dbStatus.readyState,
      configured: !!(process.env.MONGODB_URI || process.env.MONGO_URI)
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      JWT_SECRET_CONFIGURED: !!process.env.JWT_SECRET,
      ALLOWED_ORIGINS_CONFIGURED: !!process.env.ALLOWED_ORIGINS,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'default (localhost:5173)'
    }
  });
});

// ─── 404 Fallback for unmatched API routes ────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS errors surface here — return 403 instead of 500
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ message: err.message });
  }

  const statusCode = err.status || err.statusCode || 500;
  if (statusCode === 500) {
    console.error('Unhandled Server Error:', err);
  } else {
    console.warn(`Client Error (${statusCode}):`, err.message);
  }
  res.status(statusCode).json({
    message: statusCode === 500 ? 'An unexpected error occurred on the server' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = server; // Exported for integration testing

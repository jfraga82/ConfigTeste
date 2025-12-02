// If you're using dotenv via server/config/index.js, you might not need to require it here directly.
// However, it's common to load it at the very start of the main entry file.
require('dotenv').config(); // Loads .env file from root into process.env

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const apiRoutes = require('./server/api'); // Imports the main API router from server/api/index.js
const authRoutes = require('./server/routes/auth'); // Authentication routes
const { attachUserInfo, requireAuth } = require('./server/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000; // PORT from .env or default to 3000

// Validate session secret
if (!process.env.SESSION_SECRET) {
  console.error('❌ SESSION_SECRET is not set in .env file!');
  console.error('   Generate a strong secret with:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// Security Headers - Must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      // Allow 'unsafe-eval' for ParseFormula.js (dynamic formula evaluation)
      // Allow 'unsafe-inline' for inline event handlers in dialogs
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick, etc)
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));

// Session Configuration - Must be before routes
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: parseInt(process.env.SESSION_MAX_AGE || 3600000), // Default 1 hour
    sameSite: 'lax' // CSRF protection
  },
  name: 'configurator.sid' // Custom session name
}));

console.log('✅ Session middleware configured');
console.log(`   Max Age: ${process.env.SESSION_MAX_AGE || 3600000}ms`);
console.log(`   Secure: ${process.env.NODE_ENV === 'production'}`);

// Attach user info to all responses
app.use(attachUserInfo);

// Rate Limiting - Protect against DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createProductLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 product creations per 15 minutes
  message: { error: 'Too many product creation attempts, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 authentication attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' }
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply rate limiting to auth routes
app.use('/auth/', authLimiter);

// CORS Configuration - Restrict to allowed origins only
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Body Parser with size limits - Prevent large payload attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Logging Middleware
const { securityLogger } = require('./server/middleware/securityLogger');
app.use(securityLogger);

// Authentication Routes - Must be before static files
app.use('/auth', authRoutes);

// Public routes (login page) - Serve without authentication
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static files from the 'public' directory (CSS, JS, images)
// These need to be accessible without authentication for the login page
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Protected API Routes - Require authentication
app.use('/api', requireAuth, apiRoutes);

// Protected Pages - Require authentication for main application
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// All other GET requests redirect to login if not authenticated
app.get('*', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global Error Handler - Must be LAST middleware
const { errorHandler } = require('./server/utils/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`🔒 Security features enabled: Helmet, Rate Limiting, CORS, Input Validation`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 
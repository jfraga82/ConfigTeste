# Security Fixes Implementation Guide

This guide provides ready-to-implement code for fixing the critical security vulnerabilities identified in the security audit.

---

## 🔴 PHASE 1: CRITICAL FIXES (Implement Immediately)

### Fix 1: Remove Sensitive Logging

**File:** `server/config/bc.js`

**Current Code (INSECURE):**
```javascript
console.log(`TENANT_ID from env: ${process.env.TENANT_ID ? 'Loaded' : 'MISSING'} (Value: ${process.env.TENANT_ID ? process.env.TENANT_ID.substring(0, 5) + '...' : 'N/A'})`);
```

**Replace with (SECURE):**
```javascript
console.log(`TENANT_ID: ${process.env.TENANT_ID ? '✅ Loaded' : '❌ MISSING'}`);
console.log(`CLIENT_ID: ${process.env.CLIENT_ID ? '✅ Loaded' : '❌ MISSING'}`);
console.log(`CLIENT_SECRET: ${process.env.CLIENT_SECRET ? '✅ Loaded' : '❌ MISSING'}`);
console.log(`BC_BASE_URL: ${process.env.BC_BASE_URL ? '✅ Loaded' : '❌ MISSING'}`);
console.log(`BC_ENVIRONMENT_NAME: ${process.env.BC_ENVIRONMENT_NAME ? '✅ Loaded' : '❌ MISSING'}`);
console.log(`COMPANY_ID: ${process.env.COMPANY_ID ? '✅ Loaded' : '❌ MISSING'}`);
```

---

### Fix 2: Install Security Packages

**Run these commands:**
```bash
npm install helmet express-rate-limit express-validator joi dompurify isomorphic-dompurify --save
npm install --save-dev snyk
```

---

### Fix 3: Add Security Middleware

**File:** `server.js`

**Add after line 10 (after `const PORT...`):**

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
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

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 minutes for auth endpoints
  message: { error: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/', apiLimiter);
```

---

### Fix 4: Configure CORS Properly

**File:** `server.js`

**Replace line 14:**
```javascript
// OLD (INSECURE):
app.use(cors());

// NEW (SECURE):
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
```

**Add to `.env` file:**
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

---

### Fix 5: Add Request Size Limits

**File:** `server.js`

**Replace lines 15-16:**
```javascript
// OLD:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NEW:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### Fix 6: Add Input Validation

**Create new file:** `server/middleware/validation.js`

```javascript
const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for creating a product
 */
const validateProductCreation = [
  body('QuestionnaireCode')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('QuestionnaireCode must be alphanumeric with underscores, max 50 chars'),
  
  body('Attributes')
    .isArray({ min: 1, max: 100 })
    .withMessage('Attributes must be an array with 1-100 items'),
  
  body('Attributes.*.AttributeName')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[A-Za-z0-9_\s-]+$/)
    .withMessage('AttributeName must be alphanumeric, max 100 chars'),
  
  body('Attributes.*.Value')
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Attribute value must be a string, max 1000 chars'),
  
  validate
];

/**
 * Validation rules for questionnaire code param
 */
const validateQuestionnaireCode = [
  param('questionnaireCode')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Invalid questionnaire code format'),
  
  validate
];

module.exports = {
  validateProductCreation,
  validateQuestionnaireCode,
  validate
};
```

**Update:** `server/api/index.js`

```javascript
const express = require('express');
const router = express.Router();

// Import validation middleware
const { validateProductCreation, validateQuestionnaireCode } = require('../middleware/validation');

// Import other route modules here
const businessCentralRoutes = require('./businessCentralRoutes');
const { getQuestionnaireByCode, getAvailableQuestionnairesList } = require('../controllers/questionnaireController');
const { createProductFromConfiguration } = require('../controllers/productController');

// Use the imported routes
router.use('/businesscentral', businessCentralRoutes);

// Questionnaire routes with validation
router.get('/questionnaire/_GetAvailableQuestionnaires', getAvailableQuestionnairesList);
router.get('/questionnaire/:questionnaireCode', validateQuestionnaireCode, getQuestionnaireByCode);

// Product routes with validation
router.post('/product/create', validateProductCreation, createProductFromConfiguration);

// Simple test route for now, can be removed later
router.get('/test-subrouter', (req, res) => {
  res.json({ message: 'Hello from the sub-router in server/api/index.js!' });
});

module.exports = router;
```

---

### Fix 7: Sanitize Error Messages

**Create new file:** `server/utils/errorHandler.js`

```javascript
/**
 * Sanitizes error messages for client responses
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitize error for client response
 */
function sanitizeError(error, includeStack = false) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Log full error on server
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString()
  });
  
  // Return sanitized error to client
  return {
    error: error.isOperational 
      ? error.message 
      : 'An unexpected error occurred. Please try again later.',
    statusCode: error.statusCode || 500,
    ...(isDevelopment && includeStack && { stack: error.stack }),
    ...(error.details && { details: error.details })
  };
}

/**
 * Express error handler middleware
 */
function errorHandler(err, req, res, next) {
  const sanitized = sanitizeError(err);
  res.status(sanitized.statusCode).json(sanitized);
}

module.exports = { AppError, sanitizeError, errorHandler };
```

**Update:** `server/services/bcApiService.js`

Replace all `throw new Error(...)` with more specific error handling:

```javascript
const { AppError } = require('../utils/errorHandler');

// Example in getQuestionnaireJson function:
} catch (error) {
  console.error('Error calling BC OData API - QuestionnaireJson');
  
  if (error.response) {
    const bcError = error.response.data?.error?.message || 'Business Central API error';
    throw new AppError(bcError, error.response.status);
  }
  
  throw new AppError('Failed to fetch questionnaire. Please try again later.', 503);
}
```

**Update:** `server.js` (add at the end, before `app.listen`)

```javascript
const { errorHandler } = require('./server/utils/errorHandler');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use(errorHandler);
```

---

### Fix 8: Secure Business Central Configuration

**Update:** `server/config/bc.js`

```javascript
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Only show status, never values
if (process.env.NODE_ENV !== 'production') {
  console.log('--- Business Central Configuration Status ---');
  console.log(`TENANT_ID: ${process.env.TENANT_ID ? '✅' : '❌'}`);
  console.log(`CLIENT_ID: ${process.env.CLIENT_ID ? '✅' : '❌'}`);
  console.log(`CLIENT_SECRET: ${process.env.CLIENT_SECRET ? '✅' : '❌'}`);
  console.log(`BC_BASE_URL: ${process.env.BC_BASE_URL ? '✅' : '❌'}`);
  console.log(`BC_ENVIRONMENT_NAME: ${process.env.BC_ENVIRONMENT_NAME ? '✅' : '❌'}`);
  console.log(`COMPANY_ID: ${process.env.COMPANY_ID ? '✅' : '❌'}`);
}

const requiredEnvVars = [
  'TENANT_ID',
  'CLIENT_ID', 
  'CLIENT_SECRET',
  'BC_BASE_URL',
  'BC_ENVIRONMENT_NAME',
  'COMPANY_ID'
];

// Validate all required env vars are present
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missingVars.join(', '));
  console.error('Application cannot start without these variables.');
  process.exit(1);
}

const bcConfig = {
  tenantId: process.env.TENANT_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  specificBaseUrl: process.env.BC_BASE_URL,
  environmentName: process.env.BC_ENVIRONMENT_NAME,
  companyName: process.env.COMPANY_ID,
  tokenEndpoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
  scope: 'https://api.businesscentral.dynamics.com/.default'
};

// Validate config structure
if (!bcConfig.tenantId || !bcConfig.clientId || !bcConfig.clientSecret) {
  console.error('❌ Invalid Business Central configuration');
  process.exit(1);
}

console.log('✅ Business Central configuration loaded successfully');

module.exports = bcConfig;
```

---

### Fix 9: Sanitize Frontend Input

**Update:** `public/js/main.js`

Add at the top of the file:
```javascript
/**
 * Sanitize HTML to prevent XSS attacks
 */
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Highlight search term safely
 */
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return sanitizeHTML(text);
  
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  const sanitized = sanitizeHTML(text);
  
  return sanitized.replace(regex, '<mark>$1</mark>');
}
```

**Replace in `renderQuestionnaireCards` function (around line 719):**
```javascript
// OLD (INSECURE):
const regex = new RegExp(`(${searchTerm})`, 'gi');
description = description.replace(regex, '<mark>$1</mark>');
code = code.replace(regex, '<mark>$1</mark>');

// NEW (SECURE):
description = highlightSearchTerm(description, searchTerm);
code = highlightSearchTerm(code, searchTerm);
```

---

### Fix 10: Add Security Logging

**Create new file:** `server/middleware/securityLogger.js`

```javascript
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const securityLogFile = path.join(logDir, 'security.log');

/**
 * Log security events
 */
function logSecurityEvent(event, req, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    url: req.originalUrl,
    method: req.method,
    ...details
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(securityLogFile, logLine, (err) => {
    if (err) console.error('Failed to write security log:', err);
  });
  
  console.log('🔒 Security Event:', event, logEntry);
}

/**
 * Middleware to log suspicious activity
 */
function securityLogger(req, res, next) {
  // Log failed validation attempts
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 400 || res.statusCode === 403) {
      logSecurityEvent('VALIDATION_FAILED', req, {
        statusCode: res.statusCode,
        body: req.body
      });
    }
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = { logSecurityEvent, securityLogger };
```

**Add to `server.js`:**
```javascript
const { securityLogger } = require('./server/middleware/securityLogger');

// Add after other middleware
app.use(securityLogger);
```

---

## 🟠 PHASE 2: HIGH PRIORITY FIXES

### Add Basic Authentication (Optional but Recommended)

**Create:** `server/middleware/auth.js`

```javascript
/**
 * Simple API Key authentication
 * For production, use JWT or OAuth2
 */
function apiKeyAuth(req, res, next) {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
}

module.exports = { apiKeyAuth };
```

**Add to protected routes in `server/api/index.js`:**
```javascript
const { apiKeyAuth } = require('../middleware/auth');

// Protect product creation endpoint
router.post('/product/create', apiKeyAuth, validateProductCreation, createProductFromConfiguration);
```

**Add to `.env`:**
```env
API_KEYS=your-secret-key-1,your-secret-key-2
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All Phase 1 fixes implemented
- [ ] Dependencies updated (`npm update`)
- [ ] Security audit passed (`npm audit`)
- [ ] `.env` file NOT committed to git
- [ ] HTTPS configured
- [ ] CORS origins configured for production
- [ ] Rate limiting tested
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## 🧪 TESTING SECURITY FIXES

### Test Rate Limiting:
```bash
# Should block after 100 requests in 15 minutes
for i in {1..110}; do curl http://localhost:3000/api/questionnaire/_GetAvailableQuestionnaires; done
```

### Test Input Validation:
```bash
# Should return 400 Bad Request
curl -X POST http://localhost:3000/api/product/create \
  -H "Content-Type: application/json" \
  -d '{"QuestionnaireCode":"INVALID<script>alert(1)</script>","Attributes":[]}'
```

### Test CORS:
```bash
# Should block unauthorized origins
curl -H "Origin: https://malicious-site.com" \
  http://localhost:3000/api/questionnaire/_GetAvailableQuestionnaires
```

---

## 📞 SUPPORT

If you encounter any issues implementing these fixes, please review:
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**Last Updated:** November 25, 2025




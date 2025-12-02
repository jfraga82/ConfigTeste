/**
 * Authentication Middleware
 * Protects routes by ensuring user is authenticated via Azure AD
 * and validated via Business Central
 */

const { ApiError } = require('../utils/errorHandler');

/**
 * Middleware to check if user is authenticated
 * Verifies that session exists and contains user information
 * 
 * Usage:
 *   app.get('/protected-route', requireAuth, (req, res) => { ... });
 */
const requireAuth = (req, res, next) => {
  // Check if session exists and has user information
  if (req.session && req.session.user && req.session.isAuthenticated) {
    // Check if session has expired
    const now = Date.now();
    const sessionAge = now - (req.session.loginTime || now);
    const maxAge = parseInt(process.env.SESSION_MAX_AGE || 3600000); // Default 1 hour

    if (sessionAge > maxAge) {
      console.log(`[AUTH] Session expired for user: ${req.session.user.email}`);
      
      // Destroy expired session
      req.session.destroy((err) => {
        if (err) {
          console.error('[AUTH] Error destroying expired session:', err);
        }
      });

      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired. Please log in again.',
        redirect: '/login'
      });
    }

    // User is authenticated and session is valid
    console.log(`[AUTH] ✅ Authenticated request from: ${req.session.user.email}`);
    return next();
  }

  // User is not authenticated
  console.log('[AUTH] ❌ Unauthenticated request blocked');
  
  // If it's an API request, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource.',
      redirect: '/login'
    });
  }

  // For page requests, redirect to login
  return res.redirect('/login');
};

/**
 * Middleware to check if user is authenticated (for API routes)
 * Returns JSON response instead of redirect
 */
const requireAuthApi = (req, res, next) => {
  if (req.session && req.session.user && req.session.isAuthenticated) {
    const now = Date.now();
    const sessionAge = now - (req.session.loginTime || now);
    const maxAge = parseInt(process.env.SESSION_MAX_AGE || 3600000);

    if (sessionAge > maxAge) {
      req.session.destroy();
      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return next();
  }

  return res.status(401).json({
    error: 'Authentication required',
    message: 'You must be logged in to access this resource.'
  });
};

/**
 * Middleware to attach user info to response locals
 * Makes user information available in templates and responses
 */
const attachUserInfo = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
  } else {
    res.locals.user = null;
    res.locals.isAuthenticated = false;
  }
  next();
};

/**
 * Middleware to log authentication attempts
 * Security monitoring and audit trail
 */
const logAuthAttempt = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';
  const email = req.body?.email || req.query?.email || 'Unknown';

  console.log('[AUTH] Login attempt:', {
    email,
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });

  next();
};

/**
 * Middleware to check if user is already authenticated
 * Redirects to home if user tries to access login page while authenticated
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && req.session.isAuthenticated) {
    console.log(`[AUTH] User ${req.session.user.email} already authenticated, redirecting to home`);
    return res.redirect('/');
  }
  next();
};

module.exports = {
  requireAuth,
  requireAuthApi,
  attachUserInfo,
  logAuthAttempt,
  redirectIfAuthenticated
};



/**
 * Authentication Routes
 * Handles Azure AD OAuth 2.0 authentication flow and Business Central validation
 */

const express = require('express');
const router = express.Router();
const { 
  confidentialClientApplication, 
  authCodeUrlParameters, 
  tokenRequest,
  logoutRequest 
} = require('../config/azureAuth');
const { validateUserEmail } = require('../services/bcApiService');
const { logAuthAttempt, redirectIfAuthenticated } = require('../middleware/authMiddleware');

/**
 * GET /auth/signin
 * Initiates Azure AD authentication flow
 * Redirects user to Microsoft login page
 */
router.get('/signin', redirectIfAuthenticated, async (req, res) => {
  try {
    console.log('[AUTH] Initiating Azure AD sign-in flow');

    // Get authorization code URL
    const authCodeUrl = await confidentialClientApplication.getAuthCodeUrl(authCodeUrlParameters);
    
    console.log('[AUTH] Redirecting to Azure AD login page');
    res.redirect(authCodeUrl);

  } catch (error) {
    console.error('[AUTH] Error initiating sign-in:', error);
    res.redirect('/login?error=auth_failed');
  }
});

/**
 * GET /auth/callback
 * Handles the redirect from Azure AD after authentication
 * Validates user with Business Central and creates session
 */
router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      console.error('[AUTH] No authorization code received');
      return res.redirect('/login?error=no_code');
    }

    console.log('[AUTH] Authorization code received, exchanging for tokens...');

    // Exchange authorization code for tokens
    tokenRequest.code = code;
    const tokenResponse = await confidentialClientApplication.acquireTokenByCode(tokenRequest);

    if (!tokenResponse || !tokenResponse.account) {
      console.error('[AUTH] Failed to acquire tokens');
      return res.redirect('/login?error=token_failed');
    }

    console.log('[AUTH] Tokens acquired successfully');

    // Extract user information from token response
    const userEmail = tokenResponse.account.username || tokenResponse.account.email;
    const userName = tokenResponse.account.name || userEmail;
    const userId = tokenResponse.account.localAccountId || tokenResponse.account.homeAccountId;

    if (!userEmail) {
      console.error('[AUTH] No email found in token response');
      return res.redirect('/login?error=no_email');
    }

    console.log(`[AUTH] User authenticated: ${userEmail}`);

    // Validate user with Business Central
    console.log(`[AUTH] Validating user with Business Central: ${userEmail}`);
    
    try {
      const validation = await validateUserEmail(userEmail);

      if (!validation.success) {
        console.log(`[AUTH] ❌ User not authorized: ${userEmail}`);
        return res.redirect('/login?error=not_authorized&email=' + encodeURIComponent(userEmail));
      }

      console.log(`[AUTH] ✅ User authorized: ${userEmail}`);

      // Create session
      req.session.user = {
        email: userEmail,
        name: userName,
        id: userId,
        description: validation.description || '',
        loginTime: Date.now()
      };
      req.session.isAuthenticated = true;
      req.session.loginTime = Date.now();
      req.session.tokens = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        expiresOn: tokenResponse.expiresOn || null
      };

      // Save session and redirect to home
      req.session.save((err) => {
        if (err) {
          console.error('[AUTH] Error saving session:', err);
          return res.redirect('/login?error=session_failed');
        }

        console.log(`[AUTH] Session created for user: ${userEmail}`);
        res.redirect('/?login=success');
      });

    } catch (bcError) {
      console.error('[AUTH] Business Central validation failed:', bcError.message);
      
      // User is authenticated with Azure but not authorized in BC
      return res.redirect('/login?error=not_authorized&email=' + encodeURIComponent(userEmail));
    }

  } catch (error) {
    console.error('[AUTH] Error in callback:', error);
    res.redirect('/login?error=callback_failed');
  }
});

/**
 * GET /auth/logout
 * Logs out user from both application and Azure AD
 */
router.get('/logout', (req, res) => {
  const userEmail = req.session?.user?.email || 'Unknown';
  
  console.log(`[AUTH] Logging out user: ${userEmail}`);

  // Get logout URL for Azure AD
  const logoutUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(logoutRequest.postLogoutRedirectUri)}`;

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('[AUTH] Error destroying session:', err);
    }

    console.log(`[AUTH] ✅ User logged out: ${userEmail}`);
    
    // Redirect to Azure AD logout (which will then redirect to our login page)
    res.redirect(logoutUri);
  });
});

/**
 * GET /auth/check
 * API endpoint to check if user is authenticated
 * Used by frontend to verify authentication status
 */
router.get('/check', (req, res) => {
  if (req.session && req.session.user && req.session.isAuthenticated) {
    // Check if session has expired
    const now = Date.now();
    const sessionAge = now - (req.session.loginTime || now);
    const maxAge = parseInt(process.env.SESSION_MAX_AGE || 3600000);

    if (sessionAge > maxAge) {
      req.session.destroy();
      return res.json({ 
        authenticated: false,
        message: 'Session expired'
      });
    }

    return res.json({
      authenticated: true,
      user: {
        email: req.session.user.email,
        name: req.session.user.name,
        description: req.session.user.description
      }
    });
  }

  res.json({ 
    authenticated: false,
    message: 'Not authenticated'
  });
});

/**
 * POST /auth/refresh
 * Refreshes the user's session (extends expiration)
 */
router.post('/refresh', (req, res) => {
  if (req.session && req.session.user && req.session.isAuthenticated) {
    req.session.loginTime = Date.now();
    
    req.session.save((err) => {
      if (err) {
        console.error('[AUTH] Error refreshing session:', err);
        return res.status(500).json({ error: 'Failed to refresh session' });
      }

      console.log(`[AUTH] Session refreshed for user: ${req.session.user.email}`);
      res.json({ 
        success: true,
        message: 'Session refreshed'
      });
    });
  } else {
    res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please log in to refresh session'
    });
  }
});

module.exports = router;



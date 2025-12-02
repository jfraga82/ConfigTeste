/**
 * Azure AD Authentication Configuration
 * Uses MSAL (Microsoft Authentication Library) for OAuth 2.0 / OpenID Connect
 */

const msal = require('@azure/msal-node');

// Load environment variables
const clientId = process.env.AZURE_AD_CLIENT_ID;
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
const tenantId = process.env.AZURE_AD_TENANT_ID;
const authority = process.env.AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`;
const redirectUri = process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const postLogoutRedirectUri = process.env.AZURE_AD_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000/login';

// Validate required configuration
if (!clientId || !clientSecret || !tenantId) {
  console.error('❌ Azure AD configuration missing!');
  console.error('Required environment variables:');
  console.error('  - AZURE_AD_CLIENT_ID');
  console.error('  - AZURE_AD_CLIENT_SECRET');
  console.error('  - AZURE_AD_TENANT_ID');
  throw new Error('Azure AD configuration is incomplete. Please check .env file.');
}

console.log('✅ Azure AD configuration loaded');
console.log(`   Authority: ${authority}`);
console.log(`   Redirect URI: ${redirectUri}`);
console.log(`   Client ID: ${clientId.substring(0, 8)}...`);

/**
 * MSAL Configuration
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-node-migration
 */
const msalConfig = {
  auth: {
    clientId: clientId,
    authority: authority,
    clientSecret: clientSecret,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[MSAL]', message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: process.env.NODE_ENV === 'development' ? msal.LogLevel.Info : msal.LogLevel.Warning,
    }
  }
};

// Create MSAL instance
const confidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Authorization Code URL Parameters
 * Defines what permissions we request from Azure AD
 */
const authCodeUrlParameters = {
  scopes: [
    'user.read',    // Read user profile
    'email',        // Get user email
    'openid',       // OpenID Connect
    'profile'       // Get user profile information
  ],
  redirectUri: redirectUri,
};

/**
 * Token Request Parameters
 * Used to exchange authorization code for tokens
 */
const tokenRequest = {
  scopes: [
    'user.read',
    'email',
    'openid',
    'profile'
  ],
  redirectUri: redirectUri,
};

/**
 * Logout Parameters
 */
const logoutRequest = {
  postLogoutRedirectUri: postLogoutRedirectUri,
};

module.exports = {
  msalConfig,
  confidentialClientApplication,
  authCodeUrlParameters,
  tokenRequest,
  logoutRequest,
  redirectUri,
  postLogoutRedirectUri,
};



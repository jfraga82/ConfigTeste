/**
 * Login Page JavaScript
 * Handles Azure AD authentication flow
 */

// Get DOM elements
const signInButton = document.getElementById('signInButton');
const errorMessageDiv = document.getElementById('error-message');
const successMessageDiv = document.getElementById('success-message');
const loadingState = document.getElementById('loading-state');

/**
 * Parse URL parameters
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    error: params.get('error'),
    email: params.get('email'),
    message: params.get('message')
  };
}

/**
 * Show error message
 */
function showError(message) {
  errorMessageDiv.innerHTML = message;
  errorMessageDiv.style.display = 'block';
  successMessageDiv.style.display = 'none';
  loadingState.style.display = 'none';
  signInButton.style.display = 'flex';
  signInButton.disabled = false;
}

/**
 * Show success message
 */
function showSuccess(message) {
  successMessageDiv.innerHTML = message;
  successMessageDiv.style.display = 'block';
  errorMessageDiv.style.display = 'none';
}

/**
 * Show loading state
 */
function showLoading() {
  loadingState.style.display = 'block';
  signInButton.style.display = 'none';
  errorMessageDiv.style.display = 'none';
  successMessageDiv.style.display = 'none';
}

/**
 * Handle error messages from URL
 */
function handleUrlErrors() {
  const { error, email } = getUrlParams();

  if (!error) return;

  const errorMessages = {
    'auth_failed': '<strong>Authentication Failed</strong><br>Unable to initiate authentication with Microsoft Azure AD. Please try again.',
    'no_code': '<strong>Authentication Error</strong><br>No authorization code received from Microsoft. Please try again.',
    'token_failed': '<strong>Token Acquisition Failed</strong><br>Failed to obtain authentication tokens. Please try again.',
    'no_email': '<strong>Email Not Found</strong><br>Your Microsoft account does not have an email address. Please contact your administrator.',
    'not_authorized': `<strong>Access Denied</strong><br>Your account <strong>${email || 'unknown'}</strong> is not authorized to access this platform.<br><br>Please contact your administrator to request access.`,
    'session_failed': '<strong>Session Error</strong><br>Failed to create session. Please try again.',
    'callback_failed': '<strong>Callback Error</strong><br>An error occurred during authentication. Please try again.',
    'session_expired': '<strong>Session Expired</strong><br>Your session has expired. Please sign in again.',
  };

  const message = errorMessages[error] || `<strong>Unknown Error</strong><br>An unexpected error occurred. Please try again.`;
  showError(message);

  // Clean URL
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Sign in with Microsoft
 */
function signInWithMicrosoft() {
  console.log('[Login] Initiating sign-in...');
  
  // Show loading state
  showLoading();

  // Redirect to authentication endpoint
  // The server will handle the redirect to Azure AD
  window.location.href = '/auth/signin';
}

/**
 * Initialize page
 */
function initializePage() {
  console.log('[Login] Page loaded');

  // Handle errors from URL
  handleUrlErrors();

  // Add event listener to sign-in button
  signInButton.addEventListener('click', signInWithMicrosoft);

  // Prevent double-click
  signInButton.addEventListener('dblclick', (e) => {
    e.preventDefault();
  });

  console.log('[Login] Page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}



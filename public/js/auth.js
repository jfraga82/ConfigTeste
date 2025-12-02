/**
 * Authentication Module for Main Application
 * Verifies authentication status and handles logout
 */

let currentUser = null;
let authCheckInterval = null;

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function checkAuthentication() {
  try {
    const response = await fetch('/auth/check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('[Auth] Authentication check failed:', response.status);
      return false;
    }

    const data = await response.json();

    if (data.authenticated) {
      console.log('[Auth] ✅ User authenticated:', data.user.email);
      currentUser = data.user;
      updateUserInterface();
      return true;
    } else {
      console.log('[Auth] ❌ User not authenticated');
      redirectToLogin();
      return false;
    }

  } catch (error) {
    console.error('[Auth] Error checking authentication:', error);
    redirectToLogin();
    return false;
  }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  console.log('[Auth] Redirecting to login...');
  window.location.href = '/login';
}

/**
 * Logout user
 */
async function logout() {
  if (!confirm('Are you sure you want to sign out?')) {
    return;
  }

  console.log('[Auth] Logging out...');
  
  // Show loading state
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.disabled = true;
    logoutBtn.innerHTML = '<span class="logout-spinner"></span> Signing out...';
  }

  // Redirect to logout endpoint
  window.location.href = '/auth/logout';
}

/**
 * Update user interface with user information
 */
function updateUserInterface() {
  if (!currentUser) return;

  // Update user email display if element exists
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl) {
    userEmailEl.textContent = currentUser.email;
  }

  // Update user name display if element exists
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = currentUser.name || currentUser.email;
  }

  // Update user description if element exists
  const userDescEl = document.getElementById('user-description');
  if (userDescEl && currentUser.description) {
    userDescEl.textContent = currentUser.description;
  }

  // Show authenticated UI elements
  const authElements = document.querySelectorAll('[data-auth-required]');
  authElements.forEach(el => {
    el.style.display = '';
  });
}

/**
 * Refresh session (extend expiration)
 */
async function refreshSession() {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      console.log('[Auth] Session refreshed');
      return true;
    } else {
      console.log('[Auth] Failed to refresh session');
      return false;
    }

  } catch (error) {
    console.error('[Auth] Error refreshing session:', error);
    return false;
  }
}

/**
 * Initialize authentication
 */
async function initializeAuth() {
  console.log('[Auth] Initializing authentication...');

  // Check authentication status
  const isAuthenticated = await checkAuthentication();

  if (!isAuthenticated) {
    return; // Will redirect to login
  }

  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Periodic authentication check (every 5 minutes)
  authCheckInterval = setInterval(async () => {
    console.log('[Auth] Performing periodic authentication check...');
    const stillAuthenticated = await checkAuthentication();
    
    if (!stillAuthenticated) {
      clearInterval(authCheckInterval);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Refresh session on user activity (every 30 minutes of activity)
  let lastActivity = Date.now();
  let refreshTimeout = null;

  function scheduleRefresh() {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      // If user was active in the last 30 minutes, refresh session
      if (timeSinceActivity < 30 * 60 * 1000) {
        refreshSession();
        scheduleRefresh(); // Schedule next refresh
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Track user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    }, { passive: true });
  });

  // Start refresh schedule
  scheduleRefresh();

  console.log('[Auth] ✅ Authentication initialized');
}

// Export functions for use in other modules
window.authModule = {
  checkAuthentication,
  logout,
  refreshSession,
  getCurrentUser: () => currentUser
};

// Auto-initialize when script loads
// This will be called before main.js
console.log('[Auth] Auth module loaded');



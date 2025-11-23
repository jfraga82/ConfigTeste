const axios = require('axios');
const bcConfig = require('../config/bc');

let accessToken = null;
let tokenExpiryTime = 0;

/**
 * Fetches a new access token from Business Central.
 * @returns {Promise<string>} The access token.
 * @throws {Error} If token acquisition fails.
 */
const fetchNewToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', bcConfig.clientId);
    params.append('client_secret', bcConfig.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', bcConfig.scope);

    const response = await axios.post(bcConfig.tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      // Set expiry time a bit earlier than actual to be safe (e.g., 5 minutes buffer)
      tokenExpiryTime = Date.now() + (response.data.expires_in - 300) * 1000;
      console.log('Successfully fetched new Business Central access token.');
      return accessToken;
    } else {
      throw new Error('Failed to obtain access token from Business Central.');
    }
  } catch (error) {
    console.error('Error fetching new Business Central access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Gets a valid access token, fetching a new one if the current one is expired or missing.
 * @returns {Promise<string>} The access token.
 */
const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiryTime) {
    return accessToken;
  }
  console.log('Access token is expired or missing. Fetching a new one...');
  return await fetchNewToken();
};

module.exports = { getAccessToken }; 
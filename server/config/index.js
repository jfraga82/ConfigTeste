require('dotenv').config({ path: '../../.env' }); // Adjust path if .env is elsewhere

module.exports = {
  port: process.env.PORT || 3000,
  bcApiUrl: process.env.BC_API_URL,
  bcApiKey: process.env.BC_API_KEY,
  // Add other configurations as needed
}; 
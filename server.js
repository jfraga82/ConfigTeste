// If you're using dotenv via server/config/index.js, you might not need to require it here directly.
// However, it's common to load it at the very start of the main entry file.
require('dotenv').config(); // Loads .env file from root into process.env

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./server/api'); // Imports the main API router from server/api/index.js

const app = express();
const PORT = process.env.PORT || 3000; // PORT from .env or default to 3000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes - all API routes will be prefixed with /api
app.use('/api', apiRoutes);

// All other GET requests not handled by API routes or static files should serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 
const express = require('express');
const router = express.Router();
const businessCentralController = require('../controllers/businessCentralController');

// Placeholder for a route, e.g., to create something in Business Central
// router.post('/create', businessCentralController.createRecord);

// Example: Get items (replace with actual controller logic)
router.get('/items', (req, res) => {
    res.json({ message: 'Placeholder: Get Business Central items' });
});

// Example: Post data, now using a controller method
router.post('/data', businessCentralController.handlePostData);

module.exports = router; 
const express = require('express');
const router = express.Router();

// Import validation middleware
const { validateProductCreation, validateQuestionnaireCode, sanitizeBody } = require('../middleware/validation');

// Import other route modules here
const businessCentralRoutes = require('./businessCentralRoutes');
const { getQuestionnaireByCode, getAvailableQuestionnairesList } = require('../controllers/questionnaireController');
const { createProductFromConfiguration } = require('../controllers/productController');

// Apply sanitization to all POST requests
router.use(sanitizeBody);

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
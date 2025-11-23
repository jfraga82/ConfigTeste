const express = require('express');
const router = express.Router();

// Import other route modules here
const businessCentralRoutes = require('./businessCentralRoutes');
const { getQuestionnaireByCode, getAvailableQuestionnairesList } = require('../controllers/questionnaireController');
const { createProductFromConfiguration } = require('../controllers/productController');

// Use the imported routes
router.use('/businesscentral', businessCentralRoutes);

// Questionnaire routes
router.get('/questionnaire/_GetAvailableQuestionnaires', getAvailableQuestionnairesList);
router.get('/questionnaire/:questionnaireCode', getQuestionnaireByCode);

// Product routes
router.post('/product/create', createProductFromConfiguration);

// Simple test route for now, can be removed later
router.get('/test-subrouter', (req, res) => {
  res.json({ message: 'Hello from the sub-router in server/api/index.js!' });
});

module.exports = router; 
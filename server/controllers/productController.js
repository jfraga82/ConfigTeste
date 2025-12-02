const { createProduct } = require('../services/bcApiService');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { logProductCreation } = require('../middleware/securityLogger');

/**
 * Handles the request to create a product from configuration.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const createProductFromConfiguration = asyncHandler(async (req, res) => {
  const { QuestionnaireCode, Attributes } = req.body;
  
  // Validation is now handled by middleware, but double-check critical fields
  if (!QuestionnaireCode || !Attributes || !Array.isArray(Attributes)) {
    throw new AppError('Invalid request: QuestionnaireCode and Attributes array are required.', 400);
  }

  console.log('Controller: Creating product from configuration');
  console.log('QuestionnaireCode:', QuestionnaireCode);
  console.log('Attributes count:', Attributes.length);
  
  const productData = await createProduct(QuestionnaireCode, Attributes);
  
  // Log successful product creation for audit trail
  logProductCreation(req, productData);
  
  console.log('✅ Product created successfully:', productData.ItemNo || productData.ProductNo);
  res.json(productData);
});

module.exports = { createProductFromConfiguration };


const { createProduct } = require('../services/bcApiService');

/**
 * Handles the request to create a product from configuration.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const createProductFromConfiguration = async (req, res) => {
  const { QuestionnaireCode, Attributes } = req.body;
  
  if (!QuestionnaireCode || !Attributes || !Array.isArray(Attributes)) {
    return res.status(400).json({ 
      error: 'Invalid request', 
      details: 'QuestionnaireCode and Attributes array (with AttributeName and Value) are required.' 
    });
  }

  try {
    console.log('Controller: Creating product from configuration');
    console.log('QuestionnaireCode:', QuestionnaireCode);
    console.log('Attributes:', JSON.stringify(Attributes, null, 2));
    
    const productData = await createProduct(QuestionnaireCode, Attributes);
    
    console.log('Product created successfully:', productData);
    res.json(productData);
    
  } catch (error) {
    console.error('Controller: Error creating product:', error.message);
    res.status(500).json({ 
      error: 'Failed to create product from configuration.', 
      details: error.message 
    });
  }
};

module.exports = { createProductFromConfiguration };


const axios = require('axios');
const bcConfig = require('../config/bc');
const { getAccessToken } = require('./bcAuthService');
const { AppError } = require('../utils/errorHandler');

/**
 * Calls the ICRCFGConfInt_GetQuestionnaireJson web service in Business Central using ODataV4 path.
 * @param {string} questionnaireCode - The code of the questionnaire to fetch.
 * @returns {Promise<object>} The questionnaire JSON data from Business Central.
 * @throws {Error} If the API call fails or returns an error.
 */
const getQuestionnaireJson = async (questionnaireCode) => {
  try {
    const accessToken = await getAccessToken();

    // Construct the API URL based on the provided ODataV4 structure
    // Example: https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environmentName}/ODataV4/ICRCFGConfInt_GetQuestionnaireJson?Company='{companyName}'
    
    // Company name for the query parameter needs to be URL encoded.
    // The single quotes around the company name in the ?Company='{companyName}' part are literal.
    const encodedCompanyName = encodeURIComponent(bcConfig.companyName);
    
    // Add language parameter to the OData URL for Business Central
    const apiUrl = `${bcConfig.specificBaseUrl}/${bcConfig.tenantId}/${bcConfig.environmentName}/ODataV4/ICRCFGConfInt_GetQuestionnaireJson?Company='${encodedCompanyName}'&$lang=pt-PT`;

    // Construct the nested and stringified input JSON as per BC expectation
    const actualParams = {
      No: questionnaireCode // e.g., {"No": "PA_INJETADO"}
    };
    const inputJsonBody = {
      inputJson: JSON.stringify(actualParams)
    };

    // Explicitly stringify the entire body payload
    const requestPayloadString = JSON.stringify(inputJsonBody);

    console.log(`Calling BC ODataV4 API: ${apiUrl} with input string:`, requestPayloadString);

    const requestHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'pt-PT'
    };
    
    console.log('Request headers being sent:', requestHeaders);

    const response = await axios.post(apiUrl, requestPayloadString, {
      headers: requestHeaders
    });

    console.log('Response status:', response.status);
    console.log('Response headers received:', response.headers);
    console.log('Raw response data:', JSON.stringify(response.data, null, 2));

    // OData actions usually return the result directly or within a "value" field.
    // Adjust based on your actual web service response.
    if (response.data) {
      let questionnaireData = response.data;
      // If the action returns { "value": {actual_json_object} } or { "value": "some_json_string" }
      if (response.data.hasOwnProperty('value')) {
        questionnaireData = response.data.value;
      }
      
      // If questionnaireData is still a string at this point, try to parse it.
      if (typeof questionnaireData === 'string') {
        try {
          questionnaireData = JSON.parse(questionnaireData);
        } catch (parseError) {
          console.error('Error parsing JSON string from Business Central OData response:', parseError, 'Raw string:', questionnaireData);
          throw new Error('Invalid JSON string response from Business Central OData service.');
        }
      }
      
      console.log('Successfully fetched questionnaire from Business Central OData service.');
      return questionnaireData;
    } else {
      throw new Error('Empty response data from Business Central OData service.');
    }
  } catch (error) {
    // Log error details on server only
    console.error('Error calling BC OData API - GetQuestionnaireJson');
    
    if (error.response) {
      const bcError = error.response.data?.error?.message || 'Business Central API error';
      const statusCode = error.response.status || 500;
      throw new AppError(bcError, statusCode);
    }
    
    // Network or other errors
    throw new AppError('Failed to fetch questionnaire. Please try again later.', 503);
  }
};

/**
 * Calls the _GetAvailableQuestionnaires web service in Business Central using ODataV4 path.
 * @returns {Promise<Array>} The list of available questionnaires from Business Central.
 * @throws {Error} If the API call fails or returns an error.
 */
const getAvailableQuestionnaires = async () => {
  try {
    const accessToken = await getAccessToken();

    const encodedCompanyName = encodeURIComponent(bcConfig.companyName);
    
    // API URL for getting available questionnaires
    const apiUrl = `${bcConfig.specificBaseUrl}/${bcConfig.tenantId}/${bcConfig.environmentName}/ODataV4/ICRCFGConfInt_GetAvailableQuestionnaires?Company='${encodedCompanyName}'&$lang=pt-PT`;

    console.log(`Calling BC ODataV4 API: ${apiUrl}`);

    const requestHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'pt-PT'
    };
    
    console.log('Request headers being sent:', requestHeaders);

    // This endpoint doesn't require a body, just a GET or POST without parameters
    const response = await axios.post(apiUrl, {}, {
      headers: requestHeaders
    });

    console.log('Response status:', response.status);
    console.log('Raw response data:', JSON.stringify(response.data, null, 2));

    if (response.data) {
      let questionnairesData = response.data;
      
      // If the action returns { "value": [...] }
      if (response.data.hasOwnProperty('value')) {
        questionnairesData = response.data.value;
      }
      
      // If questionnairesData is still a string, try to parse it
      if (typeof questionnairesData === 'string') {
        try {
          questionnairesData = JSON.parse(questionnairesData);
        } catch (parseError) {
          console.error('Error parsing JSON string from Business Central OData response:', parseError);
          throw new Error('Invalid JSON string response from Business Central OData service.');
        }
      }
      
      console.log('Successfully fetched available questionnaires from Business Central OData service.');
      return questionnairesData;
    } else {
      throw new Error('Empty response data from Business Central OData service.');
    }
  } catch (error) {
    // Log error details on server only
    console.error('Error calling BC OData API - GetAvailableQuestionnaires');
    
    if (error.response) {
      const bcError = error.response.data?.error?.message || 'Business Central API error';
      const statusCode = error.response.status || 500;
      throw new AppError(bcError, statusCode);
    }
    
    // Network or other errors
    throw new AppError('Failed to fetch available questionnaires. Please try again later.', 503);
  }
};

/**
 * Calls the _CreateProductFromConfiguration web service in Business Central using ODataV4 path.
 * @param {string} questionnaireCode - The code of the questionnaire.
 * @param {Array} attributes - Array of attribute objects with AttributeName and Value.
 * @param {string} userEmail - The email of the authenticated user.
 * @returns {Promise<object>} The created product data from Business Central.
 * @throws {Error} If the API call fails or returns an error.
 */
const createProduct = async (questionnaireCode, attributes, userEmail) => {
  try {
    const accessToken = await getAccessToken();

    const encodedCompanyName = encodeURIComponent(bcConfig.companyName);
    
    // API URL for creating product from configuration
    const apiUrl = `${bcConfig.specificBaseUrl}/${bcConfig.tenantId}/${bcConfig.environmentName}/ODataV4/ICRCFGConfInt_CreateProductFromConfiguration?Company='${encodedCompanyName}'&$lang=pt-PT`;

    // Prepare input JSON with ExternalUserEmail right after QuestionnaireCode
    const inputParams = {
      QuestionnaireCode: questionnaireCode,
      ExternalUserEmail: userEmail,
      Attributes: attributes
    };
    
    const inputJsonBody = {
      inputJson: JSON.stringify(inputParams)
    };

    const requestPayloadString = JSON.stringify(inputJsonBody);

    console.log(`Calling BC ODataV4 API: ${apiUrl}`);
    console.log('Request payload:', requestPayloadString);

    const requestHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'pt-PT'
    };

    const response = await axios.post(apiUrl, requestPayloadString, {
      headers: requestHeaders
    });

    console.log('Response status:', response.status);
    console.log('Raw response data:', JSON.stringify(response.data, null, 2));

    if (response.data) {
      let productData = response.data;
      
      // If the action returns { "value": {...} }
      if (response.data.hasOwnProperty('value')) {
        productData = response.data.value;
      }
      
      // If productData is still a string, try to parse it
      if (typeof productData === 'string') {
        try {
          productData = JSON.parse(productData);
        } catch (parseError) {
          console.error('Error parsing JSON string from Business Central OData response:', parseError);
          throw new Error('Invalid JSON string response from Business Central OData service.');
        }
      }
      
      // Check if Business Central returned an error response
      if (productData.Success === false || productData.Error) {
        const errorMsg = productData.Error || 'Unknown error from Business Central';
        console.error('Business Central returned error:', errorMsg);
        throw new AppError(errorMsg, 400);
      }
      
      console.log('Successfully created product from configuration.');
      return productData;
    } else {
      throw new AppError('Empty response data from Business Central OData service.', 500);
    }
  } catch (error) {
    // Log error details on server only
    console.error('Error calling BC OData API - CreateProduct');
    
    // If it's already an AppError, re-throw it
    if (error.isOperational) {
      throw error;
    }
    
    if (error.response) {
      const bcError = error.response.data?.error?.message || 'Failed to create product';
      const statusCode = error.response.status || 500;
      throw new AppError(bcError, statusCode);
    }
    
    // Network or other errors
    throw new AppError('Failed to create product. Please try again later.', 503);
  }
};

/**
 * Validates if an external user email is authorized to access the configurator
 * Calls the ICRCFGConfInt_ValidateExternalUserEmail web service in Business Central
 * @param {string} emailAddress - The email address to validate
 * @returns {Promise<object>} Validation result from Business Central
 * @throws {AppError} If the API call fails or email is not authorized
 */
const validateUserEmail = async (emailAddress) => {
  try {
    const accessToken = await getAccessToken();

    // Construct the API URL for email validation
    const encodedCompanyName = encodeURIComponent(bcConfig.companyName);
    const apiUrl = `${bcConfig.specificBaseUrl}/${bcConfig.tenantId}/${bcConfig.environmentName}/ODataV4/ICRCFGConfInt_ValidateExternalUserEmail?Company='${encodedCompanyName}'`;

    // Prepare input JSON as per BC specification
    const actualParams = {
      emailAddress: emailAddress
    };
    const inputJsonBody = {
      inputJson: JSON.stringify(actualParams)
    };
    const requestPayloadString = JSON.stringify(inputJsonBody);

    console.log(`[BC] Validating email: ${emailAddress}`);
    console.log(`[BC] Calling API: ${apiUrl}`);

    const requestHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(apiUrl, requestPayloadString, {
      headers: requestHeaders,
      timeout: 10000 // 10 second timeout
    });

    console.log('[BC] Validation response:', response.data);

    // Parse the value field (BC returns JSON as string)
    let validationData;
    try {
      validationData = JSON.parse(response.data.value);
      console.log('[BC] Parsed result:', validationData.result);
    } catch (parseError) {
      console.error('[BC] Failed to parse response:', parseError);
      throw new AppError('Invalid response from Business Central', 500);
    }

    // Check if result is "ok"
    if (validationData.result === 'ok') {
      console.log(`[BC] ✅ Email validated: ${emailAddress}`);
      return {
        success: true,
        result: validationData.result,
        message: validationData.message || 'Email validated successfully',
        description: validationData.description || ''
      };
    } else {
      console.log(`[BC] ❌ Email not authorized: ${emailAddress}`);
      throw new AppError('Email not authorized', 403);
    }

  } catch (error) {
    console.error('[BC] Error validating email:', error.message);

    // If it's already an AppError, rethrow it
    if (error instanceof AppError) {
      throw error;
    }

    // Handle axios errors
    if (error.response) {
      const statusCode = error.response.status;
      const bcError = error.response.data?.error?.message || error.response.data?.message || 'Email validation failed';
      console.error(`[BC] Validation API error (${statusCode}):`, bcError);
      throw new AppError(bcError, statusCode);
    }

    // Network or other errors
    throw new AppError('Failed to validate email. Please try again later.', 503);
  }
};

module.exports = { 
  getQuestionnaireJson, 
  getAvailableQuestionnaires, 
  createProduct,
  validateUserEmail 
}; 
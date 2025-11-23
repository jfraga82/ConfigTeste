const axios = require('axios');
const bcConfig = require('../config/bc');
const { getAccessToken } = require('./bcAuthService');

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
    console.error('Error calling Business Central OData API ICRCFGConfInt_GetQuestionnaireJson:', 
                  error.response ? (error.response.data || error.response.statusText) : error.message, 
                  error.config ? `URL: ${error.config.url}` : '');
    const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message 
                       ? error.response.data.error.message 
                       : 'Failed to fetch questionnaire from Business Central OData service.';
    throw new Error(errorMessage);
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
    console.error('Error calling Business Central OData API _GetAvailableQuestionnaires:', 
                  error.response ? (error.response.data || error.response.statusText) : error.message);
    const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message 
                       ? error.response.data.error.message 
                       : 'Failed to fetch available questionnaires from Business Central OData service.';
    throw new Error(errorMessage);
  }
};

/**
 * Calls the _CreateProductFromConfiguration web service in Business Central using ODataV4 path.
 * @param {string} questionnaireCode - The code of the questionnaire.
 * @param {Array} attributes - Array of attribute objects with AttributeName and Value.
 * @returns {Promise<object>} The created product data from Business Central.
 * @throws {Error} If the API call fails or returns an error.
 */
const createProduct = async (questionnaireCode, attributes) => {
  try {
    const accessToken = await getAccessToken();

    const encodedCompanyName = encodeURIComponent(bcConfig.companyName);
    
    // API URL for creating product from configuration
    const apiUrl = `${bcConfig.specificBaseUrl}/${bcConfig.tenantId}/${bcConfig.environmentName}/ODataV4/ICRCFGConfInt_CreateProductFromConfiguration?Company='${encodedCompanyName}'&$lang=pt-PT`;

    // Prepare input JSON
    const inputParams = {
      QuestionnaireCode: questionnaireCode,
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
        throw new Error(errorMsg);
      }
      
      console.log('Successfully created product from configuration.');
      return productData;
    } else {
      throw new Error('Empty response data from Business Central OData service.');
    }
  } catch (error) {
    console.error('Error calling Business Central OData API _CreateProductFromConfiguration:', 
                  error.response ? (error.response.data || error.response.statusText) : error.message);
    const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message 
                       ? error.response.data.error.message 
                       : 'Failed to create product from configuration in Business Central OData service.';
    throw new Error(errorMessage);
  }
};

module.exports = { getQuestionnaireJson, getAvailableQuestionnaires, createProduct }; 
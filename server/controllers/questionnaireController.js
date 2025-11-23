const { getQuestionnaireJson, getAvailableQuestionnaires } = require('../services/bcApiService');

/**
 * Handles the request to get a questionnaire by its code.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const getQuestionnaireByCode = async (req, res) => {
  const { questionnaireCode } = req.params;
  if (!questionnaireCode) {
    return res.status(400).json({ error: 'Questionnaire code is required.' });
  }

  try {
    console.log(`Controller: Fetching questionnaire for code: ${questionnaireCode}`);
    const questionnaireData = await getQuestionnaireJson(questionnaireCode);
    res.json(questionnaireData);
  } catch (error) {
    console.error(`Controller: Error fetching questionnaire ${questionnaireCode}:`, error.message);
    // Send a generic error message to the client
    res.status(500).json({ error: 'Failed to retrieve questionnaire from Business Central.', details: error.message });
  }
};

/**
 * Handles the request to get available questionnaires.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const getAvailableQuestionnairesList = async (req, res) => {
  try {
    console.log('Controller: Fetching available questionnaires');
    const questionnaires = await getAvailableQuestionnaires();
    res.json(questionnaires);
  } catch (error) {
    console.error('Controller: Error fetching available questionnaires:', error.message);
    res.status(500).json({ error: 'Failed to retrieve available questionnaires from Business Central.', details: error.message });
  }
};

module.exports = { getQuestionnaireByCode, getAvailableQuestionnairesList }; 
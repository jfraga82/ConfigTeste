const { getQuestionnaireJson, getAvailableQuestionnaires } = require('../services/bcApiService');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Handles the request to get a questionnaire by its code.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const getQuestionnaireByCode = asyncHandler(async (req, res) => {
  const { questionnaireCode } = req.params;
  
  // Validation is now handled by middleware
  if (!questionnaireCode) {
    throw new AppError('Questionnaire code is required.', 400);
  }

  console.log(`Controller: Fetching questionnaire for code: ${questionnaireCode}`);
  const questionnaireData = await getQuestionnaireJson(questionnaireCode);
  res.json(questionnaireData);
});

/**
 * Handles the request to get available questionnaires.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const getAvailableQuestionnairesList = asyncHandler(async (req, res) => {
  console.log('Controller: Fetching available questionnaires');
  const questionnaires = await getAvailableQuestionnaires();
  res.json(questionnaires);
});

module.exports = { getQuestionnaireByCode, getAvailableQuestionnairesList }; 
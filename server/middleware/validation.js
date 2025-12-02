const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for creating a product
 * Protects against injection attacks and malformed data
 */
const validateProductCreation = [
  body('QuestionnaireCode')
    .exists().withMessage('QuestionnaireCode is required')
    .isString().withMessage('QuestionnaireCode must be a string')
    .isLength({ min: 1, max: 200 }).withMessage('QuestionnaireCode must be between 1-200 characters')
    // Block only specific dangerous patterns
    .not().matches(/<script/i).withMessage('Invalid characters in QuestionnaireCode')
    .not().matches(/javascript:/i).withMessage('Invalid characters in QuestionnaireCode')
    .not().contains('..').withMessage('Invalid characters in QuestionnaireCode')
    .not().contains('/').withMessage('Invalid characters in QuestionnaireCode')
    .not().contains('\\').withMessage('Invalid characters in QuestionnaireCode'),
  
  body('Attributes')
    .exists().withMessage('Attributes are required')
    .isArray({ min: 1, max: 100 }).withMessage('Attributes must be an array with 1-100 items'),
  
  body('Attributes.*.AttributeName')
    .exists().withMessage('AttributeName is required in each attribute')
    .isString().withMessage('AttributeName must be a string')
    .isLength({ min: 1, max: 200 }).withMessage('AttributeName must be between 1-200 characters')
    // Block only dangerous patterns, not normal text
    .not().matches(/<script/i).withMessage('AttributeName contains invalid characters')
    .not().matches(/<iframe/i).withMessage('AttributeName contains invalid characters')
    .not().matches(/javascript:/i).withMessage('AttributeName contains invalid characters')
    .not().matches(/on\w+\s*=/i).withMessage('AttributeName contains invalid characters'),
  
  body('Attributes.*.Value')
    .exists().withMessage('Value is required in each attribute')
    .isString().withMessage('Value must be a string')
    .isLength({ max: 2000 }).withMessage('Value must be max 2000 characters')
    // Additional sanitization - remove dangerous characters
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      // Remove potential script tags and dangerous HTML
      return value.replace(/<script.*?>.*?<\/script>/gi, '')
                  .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=\s*["'].*?["']/gi, '');
    }),
  
  validate
];

/**
 * Validation rules for questionnaire code parameter
 * Protects against path traversal and injection
 * Allows: letters, numbers, spaces, hyphens, underscores, parentheses
 */
const validateQuestionnaireCode = [
  param('questionnaireCode')
    .exists().withMessage('Questionnaire code is required')
    .isString().withMessage('Questionnaire code must be a string')
    .isLength({ min: 1, max: 200 }).withMessage('Questionnaire code must be between 1-200 characters')
    // Prevent path traversal and dangerous characters
    .not().contains('..').withMessage('Invalid characters in questionnaire code')
    .not().contains('/').withMessage('Invalid characters in questionnaire code')
    .not().contains('\\').withMessage('Invalid characters in questionnaire code')
    .not().contains('<').withMessage('Invalid characters in questionnaire code')
    .not().contains('>').withMessage('Invalid characters in questionnaire code')
    .not().contains('script').withMessage('Invalid characters in questionnaire code')
    .not().contains('javascript:').withMessage('Invalid characters in questionnaire code')
    .not().contains('data:').withMessage('Invalid characters in questionnaire code')
    // Custom sanitizer to ensure safety
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      // Remove any potential HTML/script injection while keeping valid chars
      return value.replace(/<script.*?>.*?<\/script>/gi, '')
                  .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
                  .trim();
    }),
  
  validate
];

/**
 * Sanitize request body to remove potential XSS
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove script tags and dangerous HTML
          obj[key] = obj[key]
            .replace(/<script.*?>.*?<\/script>/gi, '')
            .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=\s*["'].*?["']/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};

module.exports = {
  validateProductCreation,
  validateQuestionnaireCode,
  sanitizeBody,
  validate
};


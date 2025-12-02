const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const securityLogFile = path.join(logDir, 'security.log');

/**
 * Log security events to file and console
 * This helps track suspicious activity and potential attacks
 */
function logSecurityEvent(event, req, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    ip: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    url: req.originalUrl || req.url,
    method: req.method,
    ...details
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  // Async write to avoid blocking
  fs.appendFile(securityLogFile, logLine, (err) => {
    if (err) console.error('Failed to write security log:', err);
  });
  
  // Console log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔒 Security Event:', event, logEntry);
  }
}

/**
 * Middleware to log suspicious activity
 * Monitors for failed validations and unauthorized access attempts
 */
function securityLogger(req, res, next) {
  // Track response to log failures
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 429) {
      logSecurityEvent('VALIDATION_FAILED', req, {
        statusCode: res.statusCode,
        body: req.body,
        params: req.params
      });
    }
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 429) {
      logSecurityEvent('VALIDATION_FAILED', req, {
        statusCode: res.statusCode,
        body: req.body,
        params: req.params
      });
    }
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Log successful product creation for audit trail
 */
function logProductCreation(req, productData) {
  logSecurityEvent('PRODUCT_CREATED', req, {
    questionnaireCode: req.body.QuestionnaireCode,
    productNo: productData.ItemNo || productData.ProductNo,
    attributeCount: req.body.Attributes?.length || 0
  });
}

module.exports = { 
  logSecurityEvent, 
  securityLogger,
  logProductCreation
};




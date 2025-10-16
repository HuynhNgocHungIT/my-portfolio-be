const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation results from express-validator
 * Should be used after validation rules in routes
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errorMessages
      }
    });
  }
  
  next();
};

/**
 * Custom validation middleware for common patterns
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    // UUID pattern validation (supports v1, v4, etc.)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidPattern.test(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid ${paramName} format`,
          code: 'INVALID_ID_FORMAT'
        }
      });
    }
    
    next();
  };
};

/**
 * Middleware to sanitize request body by removing undefined/null values
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
        delete req.body[key];
      }
    });
  }
  next();
};

/**
 * Middleware to validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Page must be a positive integer',
        code: 'INVALID_PAGE'
      }
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Limit must be a positive integer between 1 and 100',
        code: 'INVALID_LIMIT'
      }
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateObjectId,
  sanitizeBody,
  validatePagination
};
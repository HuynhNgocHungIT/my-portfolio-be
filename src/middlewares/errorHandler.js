const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (skip in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message,
      code: 'VALIDATION_ERROR'
    };
    return res.status(400).json({
      success: false,
      error
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = {
      message,
      code: 'DUPLICATE_FIELD'
    };
    return res.status(409).json({
      success: false,
      error
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      code: 'INVALID_TOKEN'
    };
    return res.status(401).json({
      success: false,
      error
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      code: 'TOKEN_EXPIRED'
    };
    return res.status(401).json({
      success: false,
      error
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code || 'APPLICATION_ERROR'
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
};

module.exports = errorHandler;
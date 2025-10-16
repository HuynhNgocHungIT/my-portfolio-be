const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (optional, defaults to 'user')
   * @returns {Object} - User object and JWT token
   */
  async register(userData) {
    const { email, password, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      error.code = 'USER_EXISTS';
      throw error;
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Object} - User object and JWT token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user.toJSON();
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const tokenError = new Error('Token has expired');
        tokenError.statusCode = 401;
        tokenError.code = 'TOKEN_EXPIRED';
        throw tokenError;
      } else if (error.name === 'JsonWebTokenError') {
        const tokenError = new Error('Invalid token');
        tokenError.statusCode = 401;
        tokenError.code = 'INVALID_TOKEN';
        throw tokenError;
      } else {
        const tokenError = new Error('Token verification failed');
        tokenError.statusCode = 401;
        tokenError.code = 'TOKEN_VERIFICATION_FAILED';
        throw tokenError;
      }
    }
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Object} - New token and user data
   */
  async refreshToken(token) {
    const decoded = this.verifyToken(token);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const newToken = this.generateToken(user);

    return {
      user: user.toJSON(),
      token: newToken
    };
  }

  /**
   * Validate user credentials format
   * @param {Object} credentials - User credentials
   * @returns {Object} - Validation result
   */
  validateCredentials(credentials) {
    const errors = [];

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.push('Invalid email format');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    } else if (credentials.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration data format
   * @param {Object} userData - User registration data
   * @returns {Object} - Validation result
   */
  validateRegistrationData(userData) {
    const errors = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.password) {
      errors.push('Password is required');
    } else if (userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (userData.role && !['user', 'admin'].includes(userData.role)) {
      errors.push('Role must be either user or admin');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new AuthService();
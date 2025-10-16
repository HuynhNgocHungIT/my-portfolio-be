const authService = require('../services/authService');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, role } = req.body;

      // Validate input data
      const validation = authService.validateRegistrationData({ email, password, role });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validation.errors
          }
        });
      }

      // Register user
      const result = await authService.register({ email, password, role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input data
      const validation = authService.validateCredentials({ email, password });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validation.errors
          }
        });
      }

      // Login user
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user information
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      // User information is available from authGuard middleware
      const userId = req.user.id;

      // Get fresh user data from database
      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'User information retrieved successfully',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authorization token required',
            code: 'TOKEN_REQUIRED'
          }
        });
      }

      const token = authHeader.substring(7);
      const result = await authService.refreshToken(token);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // This endpoint exists for consistency and potential future token blacklisting
      
      res.status(200).json({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
const profileService = require('../services/profileService');

class ProfileController {
  /**
   * Get profile by user ID
   * GET /api/profile/:user_id
   */
  async getProfile(req, res, next) {
    try {
      const { user_id } = req.params;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid user ID format',
            code: 'INVALID_USER_ID'
          }
        });
      }

      // Get profile
      const profile = await profileService.getProfileByUserId(user_id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile by user ID
   * PUT /api/profile/:user_id
   */
  async updateProfile(req, res, next) {
    try {
      const { user_id } = req.params;
      const updateData = req.body;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid user ID format',
            code: 'INVALID_USER_ID'
          }
        });
      }

      // Check if the authenticated user is updating their own profile or is an admin
      if (req.user.id !== user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'You can only update your own profile',
            code: 'FORBIDDEN'
          }
        });
      }

      // Check if profile exists, if not create it
      const profileExists = await profileService.profileExists(user_id);
      let profile;

      if (!profileExists) {
        // Create new profile if it doesn't exist
        profile = await profileService.createProfile(user_id, updateData);
        
        return res.status(201).json({
          success: true,
          message: 'Profile created successfully',
          data: {
            profile
          }
        });
      } else {
        // Update existing profile
        profile = await profileService.updateProfile(user_id, updateData);
        
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            profile
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create profile for user
   * POST /api/profile/:user_id
   */
  async createProfile(req, res, next) {
    try {
      const { user_id } = req.params;
      const profileData = req.body;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid user ID format',
            code: 'INVALID_USER_ID'
          }
        });
      }

      // Check if the authenticated user is creating their own profile or is an admin
      if (req.user.id !== user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'You can only create your own profile',
            code: 'FORBIDDEN'
          }
        });
      }

      // Create profile
      const profile = await profileService.createProfile(user_id, profileData);

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete profile by user ID
   * DELETE /api/profile/:user_id
   */
  async deleteProfile(req, res, next) {
    try {
      const { user_id } = req.params;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid user ID format',
            code: 'INVALID_USER_ID'
          }
        });
      }

      // Check if the authenticated user is deleting their own profile or is an admin
      if (req.user.id !== user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'You can only delete your own profile',
            code: 'FORBIDDEN'
          }
        });
      }

      // Delete profile
      await profileService.deleteProfile(user_id);

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile with user information
   * GET /api/profile/:user_id/details
   */
  async getProfileWithUser(req, res, next) {
    try {
      const { user_id } = req.params;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid user ID format',
            code: 'INVALID_USER_ID'
          }
        });
      }

      // Get profile with user data
      const profile = await profileService.getProfileWithUser(user_id);

      res.status(200).json({
        success: true,
        message: 'Profile with user details retrieved successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all profiles (admin only)
   * GET /api/profiles
   */
  async getAllProfiles(req, res, next) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Admin access required',
            code: 'ADMIN_REQUIRED'
          }
        });
      }

      const { page = 1, limit = 10 } = req.query;

      // Get all profiles with pagination
      const result = await profileService.getAllProfiles({ page, limit });

      res.status(200).json({
        success: true,
        message: 'Profiles retrieved successfully',
        data: {
          profiles: result.profiles,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's profile
   * GET /api/profile/me
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Get profile
      const profile = await profileService.getProfileByUserId(userId);

      res.status(200).json({
        success: true,
        message: 'Your profile retrieved successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user's profile
   * PUT /api/profile/me
   */
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Check if profile exists, if not create it
      const profileExists = await profileService.profileExists(userId);
      let profile;

      if (!profileExists) {
        // Create new profile if it doesn't exist
        profile = await profileService.createProfile(userId, updateData);
        
        return res.status(201).json({
          success: true,
          message: 'Profile created successfully',
          data: {
            profile
          }
        });
      } else {
        // Update existing profile
        profile = await profileService.updateProfile(userId, updateData);
        
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            profile
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID string to validate
   * @returns {boolean} - Whether the UUID is valid
   */
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

module.exports = new ProfileController();
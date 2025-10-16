const aboutService = require('../services/aboutService');

class AboutController {
  /**
   * Get about information for authenticated user
   * GET /api/about
   */
  async getAbout(req, res, next) {
    try {
      const userId = req.user.id;

      // Get about data
      const about = await aboutService.getAbout(userId);

      if (!about) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'About information not found',
            code: 'ABOUT_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'About information retrieved successfully',
        data: {
          about
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update about information for authenticated user
   * PUT /api/about
   */
  async updateAbout(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Create or update about data
      const about = await aboutService.createOrUpdateAbout(userId, updateData);

      // Determine if this was a create or update operation
      const isNewRecord = about.created_at.getTime() === about.updated_at.getTime();

      res.status(isNewRecord ? 201 : 200).json({
        success: true,
        message: isNewRecord ? 'About information created successfully' : 'About information updated successfully',
        data: {
          about
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get about information by user ID (public endpoint)
   * GET /api/about/:user_id
   */
  async getAboutByUserId(req, res, next) {
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

      // Get about data
      const about = await aboutService.getAboutByUserId(user_id);

      if (!about) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'About information not found',
            code: 'ABOUT_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'About information retrieved successfully',
        data: {
          about
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete about information for authenticated user
   * DELETE /api/about
   */
  async deleteAbout(req, res, next) {
    try {
      const userId = req.user.id;

      // Delete about data
      await aboutService.deleteAbout(userId);

      res.status(200).json({
        success: true,
        message: 'About information deleted successfully'
      });
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

module.exports = new AboutController();
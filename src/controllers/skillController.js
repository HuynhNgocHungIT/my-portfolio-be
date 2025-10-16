const skillService = require('../services/skillService');

class SkillController {
  /**
   * Get all skills for current user
   * GET /api/skills
   */
  async getMySkills(req, res, next) {
    try {
      const userId = req.user.id;
      const { sortBy = 'level', sortOrder = 'DESC', category } = req.query;

      // Get skills for current user
      const skills = await skillService.getSkillsByUserId(userId, {
        sortBy,
        sortOrder,
        category
      });

      res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: {
          skills
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get skills by user ID (public access)
   * GET /api/skills/user/:user_id
   */
  async getSkillsByUserId(req, res, next) {
    try {
      const { user_id } = req.params;
      const { sortBy = 'level', sortOrder = 'DESC', category } = req.query;

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

      // Get skills for specified user
      const skills = await skillService.getSkillsByUserId(user_id, {
        sortBy,
        sortOrder,
        category
      });

      res.status(200).json({
        success: true,
        message: 'User skills retrieved successfully',
        data: {
          skills
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get skills grouped by category for current user
   * GET /api/skills/categories
   */
  async getSkillsByCategory(req, res, next) {
    try {
      const userId = req.user.id;

      // Get skills grouped by category
      const skillsByCategory = await skillService.getSkillsByCategory(userId);

      res.status(200).json({
        success: true,
        message: 'Skills by category retrieved successfully',
        data: {
          skillsByCategory
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get skill statistics for current user
   * GET /api/skills/stats
   */
  async getSkillStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get skill statistics
      const stats = await skillService.getSkillStats(userId);

      res.status(200).json({
        success: true,
        message: 'Skill statistics retrieved successfully',
        data: {
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get skill by ID
   * GET /api/skills/:id
   */
  async getSkillById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate skill ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid skill ID format',
            code: 'INVALID_SKILL_ID'
          }
        });
      }

      // Get skill with ownership validation
      const skill = await skillService.getSkillById(id, userId);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Skill not found or access denied',
            code: 'SKILL_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Skill retrieved successfully',
        data: {
          skill
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new skill
   * POST /api/skills
   */
  async createSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const skillData = req.body;

      // Create skill
      const skill = await skillService.createSkill(skillData, userId);

      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: {
          skill
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update skill by ID
   * PUT /api/skills/:id
   */
  async updateSkill(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Validate skill ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid skill ID format',
            code: 'INVALID_SKILL_ID'
          }
        });
      }

      // Update skill (with user ownership validation)
      const skill = await skillService.updateSkill(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Skill updated successfully',
        data: {
          skill
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete skill by ID
   * DELETE /api/skills/:id
   */
  async deleteSkill(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate skill ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid skill ID format',
            code: 'INVALID_SKILL_ID'
          }
        });
      }

      // Delete skill (with user ownership validation)
      await skillService.deleteSkill(id, userId);

      res.status(200).json({
        success: true,
        message: 'Skill deleted successfully'
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

module.exports = new SkillController();
const { Skill } = require('../models');
const { Op } = require('sequelize');

class SkillService {
  /**
   * Get all skills for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (sort, category filter)
   * @returns {Promise<Array>} Array of skills
   */
  async getSkillsByUserId(userId, options = {}) {
    try {
      const { sortBy = 'level', sortOrder = 'DESC', category } = options;
      
      const whereClause = { user_id: userId };
      
      // Add category filter if provided
      if (category) {
        whereClause.category = category;
      }

      const skills = await Skill.findAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'level', 'icon', 'category', 'created_at']
      });

      return skills;
    } catch (error) {
      throw new Error(`Failed to retrieve skills: ${error.message}`);
    }
  }

  /**
   * Get skill by ID
   * @param {string} skillId - Skill ID
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<Object|null>} Skill object or null
   */
  async getSkillById(skillId, userId) {
    try {
      const skill = await Skill.findOne({
        where: { 
          id: skillId,
          user_id: userId 
        },
        attributes: ['id', 'name', 'level', 'icon', 'category', 'created_at']
      });

      return skill;
    } catch (error) {
      throw new Error(`Failed to retrieve skill: ${error.message}`);
    }
  }

  /**
   * Create a new skill
   * @param {Object} skillData - Skill data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created skill
   */
  async createSkill(skillData, userId) {
    try {
      const { name, level, icon, category } = skillData;

      // Check if skill with same name already exists for this user
      const existingSkill = await Skill.findOne({
        where: {
          user_id: userId,
          name: name.trim()
        }
      });

      if (existingSkill) {
        throw new Error('A skill with this name already exists');
      }

      const skill = await Skill.create({
        user_id: userId,
        name: name.trim(),
        level: parseInt(level),
        icon: icon || null,
        category: category ? category.trim() : null
      });

      return {
        id: skill.id,
        name: skill.name,
        level: skill.level,
        icon: skill.icon,
        category: skill.category,
        created_at: skill.created_at
      };
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to create skill: ${error.message}`);
    }
  }

  /**
   * Update a skill
   * @param {string} skillId - Skill ID
   * @param {Object} skillData - Updated skill data
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<Object>} Updated skill
   */
  async updateSkill(skillId, skillData, userId) {
    try {
      const skill = await Skill.findOne({
        where: { 
          id: skillId,
          user_id: userId 
        }
      });

      if (!skill) {
        throw new Error('Skill not found or access denied');
      }

      const { name, level, icon, category } = skillData;

      // Check if updating name would create a duplicate
      if (name && name.trim() !== skill.name) {
        const existingSkill = await Skill.findOne({
          where: {
            user_id: userId,
            name: name.trim(),
            id: { [Op.ne]: skillId }
          }
        });

        if (existingSkill) {
          throw new Error('A skill with this name already exists');
        }
      }

      // Update skill
      await skill.update({
        name: name ? name.trim() : skill.name,
        level: level !== undefined ? parseInt(level) : skill.level,
        icon: icon !== undefined ? icon : skill.icon,
        category: category !== undefined ? (category ? category.trim() : null) : skill.category
      });

      return {
        id: skill.id,
        name: skill.name,
        level: skill.level,
        icon: skill.icon,
        category: skill.category,
        created_at: skill.created_at
      };
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to update skill: ${error.message}`);
    }
  }

  /**
   * Delete a skill
   * @param {string} skillId - Skill ID
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<boolean>} Success status
   */
  async deleteSkill(skillId, userId) {
    try {
      const skill = await Skill.findOne({
        where: { 
          id: skillId,
          user_id: userId 
        }
      });

      if (!skill) {
        throw new Error('Skill not found or access denied');
      }

      await skill.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete skill: ${error.message}`);
    }
  }

  /**
   * Get skills grouped by category
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Skills grouped by category
   */
  async getSkillsByCategory(userId) {
    try {
      const skills = await Skill.findAll({
        where: { user_id: userId },
        order: [['level', 'DESC'], ['name', 'ASC']],
        attributes: ['id', 'name', 'level', 'icon', 'category', 'created_at']
      });

      // Group skills by category
      const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      }, {});

      return groupedSkills;
    } catch (error) {
      throw new Error(`Failed to retrieve skills by category: ${error.message}`);
    }
  }

  /**
   * Get skill statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Skill statistics
   */
  async getSkillStats(userId) {
    try {
      const skills = await Skill.findAll({
        where: { user_id: userId },
        attributes: ['level', 'category']
      });

      const totalSkills = skills.length;
      const averageLevel = totalSkills > 0 
        ? Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / totalSkills)
        : 0;
      
      const categories = [...new Set(skills.map(skill => skill.category || 'Uncategorized'))];
      const expertSkills = skills.filter(skill => skill.level >= 80).length;

      return {
        totalSkills,
        averageLevel,
        categoriesCount: categories.length,
        expertSkills,
        categories
      };
    } catch (error) {
      throw new Error(`Failed to retrieve skill statistics: ${error.message}`);
    }
  }
}

module.exports = new SkillService();
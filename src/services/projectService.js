const { Project, User } = require('../models');

class ProjectService {
  /**
   * Get all projects for a user with pagination and filtering
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} - Paginated projects
   */
  async getProjectsByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const result = await Project.findByUserId(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    });

    return {
      projects: result.rows.map(project => project.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  /**
   * Get project by ID with user validation
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID (for ownership validation)
   * @returns {Object} - Project object
   */
  async getProjectById(projectId, userId = null) {
    let project;
    
    if (userId) {
      // Get project with user validation
      project = await Project.findByIdAndUser(projectId, userId);
      if (!project) {
        const error = new Error('Project not found or access denied');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }
    } else {
      // Get project without user validation (for public access)
      project = await Project.findByPk(projectId);
      if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }
    }

    return project.toJSON();
  }

  /**
   * Create a new project
   * @param {string} userId - User ID
   * @param {Object} projectData - Project data
   * @returns {Object} - Created project object
   */
  async createProject(userId, projectData) {
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Validate project data
    const validation = this.validateProjectData(projectData);
    if (!validation.isValid) {
      const error = new Error('Invalid project data');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Create project
    const project = await Project.create({
      user_id: userId,
      ...projectData
    });

    return project.toJSON();
  }

  /**
   * Update project by ID
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID (for ownership validation)
   * @param {Object} updateData - Project update data
   * @returns {Object} - Updated project object
   */
  async updateProject(projectId, userId, updateData) {
    // Find existing project with user validation
    const project = await Project.findByIdAndUser(projectId, userId);
    if (!project) {
      const error = new Error('Project not found or access denied');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Validate update data
    const validation = this.validateProjectData(updateData, true);
    if (!validation.isValid) {
      const error = new Error('Invalid project data');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Update project using the model's updateProject method
    await project.updateProject(updateData);
    
    // Fetch and return updated project
    const updatedProject = await Project.findByPk(projectId);
    return updatedProject.toJSON();
  }

  /**
   * Delete project by ID
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID (for ownership validation)
   * @returns {boolean} - Success status
   */
  async deleteProject(projectId, userId) {
    const project = await Project.findByIdAndUser(projectId, userId);
    if (!project) {
      const error = new Error('Project not found or access denied');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    await project.destroy();
    return true;
  }

  /**
   * Get all projects (public access) with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} - Paginated projects
   */
  async getAllProjects(options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }],
      distinct: true
    });

    return {
      projects: rows.map(project => project.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  /**
   * Search projects by tags or title
   * @param {Object} searchOptions - Search options
   * @returns {Object} - Search results
   */
  async searchProjects(searchOptions = {}) {
    const { query, tags, page = 1, limit = 10, userId } = searchOptions;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    const { Op } = require('sequelize');

    // Add user filter if provided
    if (userId) {
      whereClause.user_id = userId;
    }

    // Add text search in title and description
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ];
    }

    // Add tags filter
    if (tags && Array.isArray(tags) && tags.length > 0) {
      whereClause.tags = {
        [Op.contains]: tags
      };
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return {
      projects: rows.map(project => project.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  /**
   * Get project statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} - Project statistics
   */
  async getProjectStats(userId) {
    const { Op } = require('sequelize');
    
    const stats = await Project.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const totalProjects = await Project.count({
      where: { user_id: userId }
    });

    const result = {
      total: totalProjects,
      active: 0,
      completed: 0,
      archived: 0
    };

    stats.forEach(stat => {
      result[stat.status] = parseInt(stat.count);
    });

    return result;
  }

  /**
   * Validate project data
   * @param {Object} projectData - Project data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} - Validation result
   */
  validateProjectData(projectData, isUpdate = false) {
    const errors = [];

    // Title validation (required for create, optional for update)
    if (!isUpdate && !projectData.title) {
      errors.push('Title is required');
    } else if (projectData.title !== undefined) {
      if (typeof projectData.title !== 'string') {
        errors.push('Title must be a string');
      } else if (projectData.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (projectData.title.length > 255) {
        errors.push('Title must not exceed 255 characters');
      }
    }

    // Description validation (required for create, optional for update)
    if (!isUpdate && !projectData.description) {
      errors.push('Description is required');
    } else if (projectData.description !== undefined) {
      if (typeof projectData.description !== 'string') {
        errors.push('Description must be a string');
      } else if (projectData.description.trim().length === 0) {
        errors.push('Description cannot be empty');
      } else if (projectData.description.length > 5000) {
        errors.push('Description must not exceed 5000 characters');
      }
    }

    // Tags validation (optional)
    if (projectData.tags !== undefined && projectData.tags !== null) {
      if (!Array.isArray(projectData.tags)) {
        errors.push('Tags must be an array');
      } else {
        projectData.tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            errors.push(`Tag at index ${index} must be a string`);
          } else if (tag.length === 0 || tag.length > 50) {
            errors.push(`Tag at index ${index} must be between 1 and 50 characters`);
          }
        });
      }
    }

    // Thumbnail validation (optional)
    if (projectData.thumbnail !== undefined && projectData.thumbnail !== null) {
      if (typeof projectData.thumbnail !== 'string') {
        errors.push('Thumbnail must be a string URL');
      } else if (projectData.thumbnail && !/^https?:\/\/.+/.test(projectData.thumbnail)) {
        errors.push('Thumbnail must be a valid URL');
      }
    }

    // Link validation (optional)
    if (projectData.link !== undefined && projectData.link !== null) {
      if (typeof projectData.link !== 'string') {
        errors.push('Link must be a string URL');
      } else if (projectData.link && !/^https?:\/\/.+/.test(projectData.link)) {
        errors.push('Link must be a valid URL');
      }
    }

    // Status validation (optional)
    if (projectData.status !== undefined) {
      const validStatuses = ['active', 'completed', 'archived'];
      if (!validStatuses.includes(projectData.status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if project exists and belongs to user
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {boolean} - Project existence and ownership status
   */
  async projectExistsForUser(projectId, userId) {
    const project = await Project.findByIdAndUser(projectId, userId);
    return !!project;
  }

  /**
   * Get unique tags from all projects
   * @param {string} userId - User ID (optional, for user-specific tags)
   * @returns {Array} - Array of unique tags
   */
  async getUniqueTags(userId = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {};
    if (userId) {
      whereClause.user_id = userId;
    }

    const projects = await Project.findAll({
      where: whereClause,
      attributes: ['tags'],
      raw: true
    });

    const allTags = projects
      .filter(project => project.tags && Array.isArray(project.tags))
      .flatMap(project => project.tags);

    return [...new Set(allTags)].sort();
  }
}

module.exports = new ProjectService();
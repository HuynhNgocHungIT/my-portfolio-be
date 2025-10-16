const projectService = require("../services/projectService");

class ProjectController {
  /**
   * Get all projects with pagination and filtering
   * GET /api/projects
   */
  async getAllProjects(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      // Get all projects with pagination
      const result = await projectService.getAllProjects({
        page,
        limit,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: {
          projects: result.projects,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get projects by user ID
   * GET /api/projects/user/:user_id
   */
  async getProjectsByUserId(req, res, next) {
    try {
      const { user_id } = req.params;
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid user ID format",
            code: "INVALID_USER_ID",
          },
        });
      }

      // Get projects for user
      const result = await projectService.getProjectsByUserId(user_id, {
        page,
        limit,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "User projects retrieved successfully",
        data: {
          projects: result.projects,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's projects
   * GET /api/projects/me
   */
  async getMyProjects(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      // Get projects for current user
      const result = await projectService.getProjectsByUserId(userId, {
        page,
        limit,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Your projects retrieved successfully",
        data: {
          projects: result.projects,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate project ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid project ID format",
            code: "INVALID_PROJECT_ID",
          },
        });
      }

      // Get project (public access, no user validation)
      const project = await projectService.getProjectById(id);

      res.status(200).json({
        success: true,
        message: "Project retrieved successfully",
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new project
   * POST /api/projects
   */
  async createProject(req, res, next) {
    try {
      const userId = req.user.id;
      const projectData = req.body;

      // Create project
      const project = await projectService.createProject(userId, projectData);

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project by ID
   * PUT /api/projects/:id
   */
  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Validate project ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid project ID format",
            code: "INVALID_PROJECT_ID",
          },
        });
      }

      // Update project (with user ownership validation)
      const project = await projectService.updateProject(
        id,
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete project by ID
   * DELETE /api/projects/:id
   */
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate project ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid project ID format",
            code: "INVALID_PROJECT_ID",
          },
        });
      }

      // Delete project (with user ownership validation)
      await projectService.deleteProject(id, userId);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search projects
   * GET /api/projects/search
   */
  async searchProjects(req, res, next) {
    try {
      const { query, tags, page = 1, limit = 10, userId } = req.query;

      // Parse tags if provided
      let parsedTags = null;
      if (tags) {
        try {
          parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: {
              message: "Invalid tags format. Tags should be an array.",
              code: "INVALID_TAGS_FORMAT",
            },
          });
        }
      }

      // Validate userId if provided
      if (userId && !this.isValidUUID(userId)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid user ID format",
            code: "INVALID_USER_ID",
          },
        });
      }

      // Search projects
      const result = await projectService.searchProjects({
        query,
        tags: parsedTags,
        page,
        limit,
        userId,
      });

      res.status(200).json({
        success: true,
        message: "Projects search completed successfully",
        data: {
          projects: result.projects,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project statistics for current user
   * GET /api/projects/stats
   */
  async getProjectStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get project statistics
      const stats = await projectService.getProjectStats(userId);

      res.status(200).json({
        success: true,
        message: "Project statistics retrieved successfully",
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unique tags
   * GET /api/projects/tags
   */
  async getUniqueTags(req, res, next) {
    try {
      const { userId } = req.query;

      // Validate userId if provided
      if (userId && !this.isValidUUID(userId)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid user ID format",
            code: "INVALID_USER_ID",
          },
        });
      }

      // Get unique tags
      const tags = await projectService.getUniqueTags(userId);

      res.status(200).json({
        success: true,
        message: "Unique tags retrieved successfully",
        data: {
          tags,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project by ID with ownership validation (for authenticated user)
   * GET /api/projects/:id/me
   */
  async getMyProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate project ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid project ID format",
            code: "INVALID_PROJECT_ID",
          },
        });
      }

      // Get project with user validation
      const project = await projectService.getProjectById(id, userId);

      res.status(200).json({
        success: true,
        message: "Your project retrieved successfully",
        data: {
          project,
        },
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
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

module.exports = new ProjectController();

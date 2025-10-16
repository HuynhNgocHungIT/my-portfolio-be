const postService = require("../services/postService");

class PostController {
  /**
   * Get all published posts with pagination and filtering
   * GET /api/posts
   */
  async getAllPosts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        tags,
        sortBy = "published_at",
        sortOrder = "DESC",
      } = req.query;

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

      // Get all published posts with pagination
      const result = await postService.getPublishedPosts({
        page,
        limit,
        tags: parsedTags,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Published posts retrieved successfully",
        data: {
          posts: result.posts,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's posts
   * GET /api/posts/me
   */
  async getMyPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 10,
        status,
        tags,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

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

      // Get posts for current user
      const result = await postService.getPostsByUser(userId, {
        page,
        limit,
        status,
        tags: parsedTags,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Your posts retrieved successfully",
        data: {
          posts: result.posts,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get published post by ID (public access with view counting)
   * GET /api/posts/:id
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Get published post and increment view count
      const post = await postService.getPublishedPostById(id);

      res.status(200).json({
        success: true,
        message: "Post retrieved successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post by ID with ownership validation (for authenticated user)
   * GET /api/posts/:id/me
   */
  async getMyPostById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Get post with user validation
      const post = await postService.getPostByIdAndUser(id, userId);

      res.status(200).json({
        success: true,
        message: "Your post retrieved successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new post
   * POST /api/posts
   */
  async createPost(req, res, next) {
    try {
      const userId = req.user.id;
      const postData = req.body;

      // Create post
      const post = await postService.createPost(userId, postData);

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update post by ID
   * PUT /api/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Update post (with user ownership validation)
      const post = await postService.updatePost(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete post by ID
   * DELETE /api/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Delete post (with user ownership validation)
      await postService.deletePost(id, userId);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish a post
   * PUT /api/posts/:id/publish
   */
  async publishPost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Publish post
      const post = await postService.publishPost(id, userId);

      res.status(200).json({
        success: true,
        message: "Post published successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unpublish a post (set to draft)
   * PUT /api/posts/:id/unpublish
   */
  async unpublishPost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate post ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid post ID format",
            code: "INVALID_POST_ID",
          },
        });
      }

      // Unpublish post
      const post = await postService.unpublishPost(id, userId);

      res.status(200).json({
        success: true,
        message: "Post unpublished successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post statistics for current user
   * GET /api/posts/stats
   */
  async getPostStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get post statistics
      const stats = await postService.getPostStats(userId);

      res.status(200).json({
        success: true,
        message: "Post statistics retrieved successfully",
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search posts by tags
   * GET /api/posts/search
   */
  async searchPosts(req, res, next) {
    try {
      const { tags, page = 1, limit = 10 } = req.query;

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

      if (!parsedTags || parsedTags.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Tags parameter is required for search",
            code: "TAGS_REQUIRED",
          },
        });
      }

      // Search posts by tags
      const result = await postService.getPostsByTags(parsedTags, {
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Posts search completed successfully",
        data: {
          posts: result.posts,
          pagination: result.pagination,
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

module.exports = new PostController();

const { Post, User } = require('../models');

class PostService {
  /**
   * Get all posts for a user with pagination and filtering
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit, status, tags, sortBy, sortOrder)
   * @returns {Promise<Object>} Posts with pagination info
   */
  async getPostsByUser(userId, options = {}) {
    try {
      const result = await Post.findByUserId(userId, options);
      
      const { page = 1, limit = 10 } = options;
      const totalPages = Math.ceil(result.count / limit);
      
      return {
        posts: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: result.count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  /**
   * Get all published posts with pagination and filtering
   * @param {Object} options - Query options (page, limit, tags, sortBy, sortOrder)
   * @returns {Promise<Object>} Published posts with pagination info
   */
  async getPublishedPosts(options = {}) {
    try {
      const result = await Post.findPublished(options);
      
      const { page = 1, limit = 10 } = options;
      const totalPages = Math.ceil(result.count / limit);
      
      return {
        posts: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: result.count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch published posts: ${error.message}`);
    }
  }

  /**
   * Get a specific post by ID for a user
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Post data
   */
  async getPostByIdAndUser(postId, userId) {
    try {
      const post = await Post.findByIdAndUser(postId, userId);
      
      if (!post) {
        throw new Error('Post not found or access denied');
      }
      
      return post;
    } catch (error) {
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  }

  /**
   * Get a published post by ID and increment view count
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  async getPublishedPostById(postId) {
    try {
      const post = await Post.findPublishedById(postId);
      
      if (!post) {
        throw new Error('Published post not found');
      }
      
      // Increment view count
      await post.incrementViews();
      
      return post;
    } catch (error) {
      throw new Error(`Failed to fetch published post: ${error.message}`);
    }
  }

  /**
   * Create a new post
   * @param {string} userId - User ID
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  async createPost(userId, postData) {
    try {
      // Validate required fields
      if (!postData.title || !postData.content) {
        throw new Error('Title and content are required');
      }

      const post = await Post.create({
        user_id: userId,
        title: postData.title,
        content: postData.content,
        cover_image: postData.cover_image || null,
        tags: postData.tags || [],
        status: postData.status || 'draft'
      });

      return post;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(postId, userId, updateData) {
    try {
      const post = await Post.findByIdAndUser(postId, userId);
      
      if (!post) {
        throw new Error('Post not found or access denied');
      }

      await post.updatePost(updateData);
      await post.reload();
      
      return post;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePost(postId, userId) {
    try {
      const post = await Post.findByIdAndUser(postId, userId);
      
      if (!post) {
        throw new Error('Post not found or access denied');
      }

      await post.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  /**
   * Publish a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated post
   */
  async publishPost(postId, userId) {
    try {
      const post = await Post.findByIdAndUser(postId, userId);
      
      if (!post) {
        throw new Error('Post not found or access denied');
      }

      await post.publish();
      await post.reload();
      
      return post;
    } catch (error) {
      throw new Error(`Failed to publish post: ${error.message}`);
    }
  }

  /**
   * Unpublish a post (set to draft)
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated post
   */
  async unpublishPost(postId, userId) {
    try {
      const post = await Post.findByIdAndUser(postId, userId);
      
      if (!post) {
        throw new Error('Post not found or access denied');
      }

      await post.unpublish();
      await post.reload();
      
      return post;
    } catch (error) {
      throw new Error(`Failed to unpublish post: ${error.message}`);
    }
  }

  /**
   * Get posts filtered by tags
   * @param {Array} tags - Array of tags to filter by
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Filtered posts with pagination
   */
  async getPostsByTags(tags, options = {}) {
    try {
      const queryOptions = { ...options, tags };
      return await this.getPublishedPosts(queryOptions);
    } catch (error) {
      throw new Error(`Failed to fetch posts by tags: ${error.message}`);
    }
  }

  /**
   * Get post statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Post statistics
   */
  async getPostStats(userId) {
    try {
      const { Op } = require('sequelize');
      
      const totalPosts = await Post.count({
        where: { user_id: userId }
      });

      const publishedPosts = await Post.count({
        where: { 
          user_id: userId,
          status: 'published'
        }
      });

      const draftPosts = await Post.count({
        where: { 
          user_id: userId,
          status: 'draft'
        }
      });

      const totalViews = await Post.sum('views', {
        where: { user_id: userId }
      }) || 0;

      const mostViewedPost = await Post.findOne({
        where: { user_id: userId },
        order: [['views', 'DESC']],
        attributes: ['id', 'title', 'views']
      });

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        mostViewedPost
      };
    } catch (error) {
      throw new Error(`Failed to fetch post statistics: ${error.message}`);
    }
  }
}

module.exports = new PostService();
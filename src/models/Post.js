const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notEmpty: {
          msg: 'User ID is required'
        }
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title is required'
        },
        len: {
          args: [1, 255],
          msg: 'Title must be between 1 and 255 characters'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Content is required'
        },
        len: {
          args: [1, 50000],
          msg: 'Content must be between 1 and 50000 characters'
        }
      }
    },
    cover_image: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Cover image must be a valid URL'
        }
      }
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidTags(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          if (value && value.length > 0) {
            value.forEach((tag, index) => {
              if (typeof tag !== 'string') {
                throw new Error(`Tag at index ${index} must be a string`);
              }
              if (tag.length === 0 || tag.length > 50) {
                throw new Error(`Tag at index ${index} must be between 1 and 50 characters`);
              }
            });
          }
        }
      }
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'published']],
          msg: 'Status must be either draft or published'
        }
      }
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Views cannot be negative'
        }
      }
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['published_at']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['title']
      }
    ],
    hooks: {
      beforeUpdate: (post) => {
        // Auto-set published_at when status changes to published
        if (post.changed('status') && post.status === 'published' && !post.published_at) {
          post.published_at = new Date();
        }
        // Clear published_at when status changes to draft
        if (post.changed('status') && post.status === 'draft') {
          post.published_at = null;
        }
      },
      beforeCreate: (post) => {
        // Auto-set published_at when creating a published post
        if (post.status === 'published' && !post.published_at) {
          post.published_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Post.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  Post.prototype.incrementViews = async function() {
    return await this.increment('views', { by: 1 });
  };

  Post.prototype.publish = async function() {
    return await this.update({
      status: 'published',
      published_at: new Date()
    });
  };

  Post.prototype.unpublish = async function() {
    return await this.update({
      status: 'draft',
      published_at: null
    });
  };

  // Class methods
  Post.findByUserId = async function(userId, options = {}) {
    const { page = 1, limit = 10, status, tags, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    // Add tag filtering if provided
    const queryOptions = {
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    };

    // Add tag filtering using JSONB contains operator
    if (tags && tags.length > 0) {
      const { Op } = require('sequelize');
      whereClause.tags = {
        [Op.contains]: tags
      };
    }

    return await this.findAndCountAll(queryOptions);
  };

  Post.findPublished = async function(options = {}) {
    const { page = 1, limit = 10, tags, sortBy = 'published_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { 
      status: 'published',
      published_at: {
        [require('sequelize').Op.not]: null
      }
    };

    const queryOptions = {
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    };

    // Add tag filtering using JSONB contains operator
    if (tags && tags.length > 0) {
      const { Op } = require('sequelize');
      whereClause.tags = {
        [Op.contains]: tags
      };
    }

    return await this.findAndCountAll(queryOptions);
  };

  Post.findByIdAndUser = async function(postId, userId) {
    return await this.findOne({
      where: { 
        id: postId,
        user_id: userId 
      }
    });
  };

  Post.findPublishedById = async function(postId) {
    return await this.findOne({
      where: { 
        id: postId,
        status: 'published',
        published_at: {
          [require('sequelize').Op.not]: null
        }
      }
    });
  };

  Post.prototype.updatePost = async function(updateData) {
    const allowedFields = ['title', 'content', 'cover_image', 'tags', 'status'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return await this.update(filteredData);
  };

  return Post;
};
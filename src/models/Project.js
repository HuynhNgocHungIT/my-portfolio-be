const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Description is required'
        },
        len: {
          args: [1, 5000],
          msg: 'Description must be between 1 and 5000 characters'
        }
      }
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
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Thumbnail must be a valid URL'
        }
      }
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Link must be a valid URL'
        }
      }
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'completed', 'archived']],
          msg: 'Status must be one of: active, completed, archived'
        }
      }
    }
  }, {
    tableName: 'projects',
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
        fields: ['created_at']
      },
      {
        fields: ['title']
      }
    ]
  });

  // Instance methods
  Project.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  // Class methods
  Project.findByUserId = async function(userId, options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    return await this.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });
  };

  Project.findByIdAndUser = async function(projectId, userId) {
    return await this.findOne({
      where: { 
        id: projectId,
        user_id: userId 
      }
    });
  };

  Project.prototype.updateProject = async function(updateData) {
    const allowedFields = ['title', 'description', 'tags', 'thumbnail', 'link', 'status'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return await this.update(filteredData);
  };

  return Project;
};
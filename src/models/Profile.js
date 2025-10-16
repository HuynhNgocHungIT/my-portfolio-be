const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Profile = sequelize.define('Profile', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is required'
        },
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters'
        }
      }
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Avatar must be a valid URL'
        }
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Bio must not exceed 2000 characters'
        }
      }
    },
    contact: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isValidContact(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Contact must be a valid JSON object');
          }
          if (value) {
            const allowedFields = ['email', 'phone', 'location', 'website'];
            const providedFields = Object.keys(value);
            const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
            if (invalidFields.length > 0) {
              throw new Error(`Invalid contact fields: ${invalidFields.join(', ')}`);
            }
            // Validate email format if provided
            if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
              throw new Error('Contact email must be a valid email address');
            }
            // Validate website URL if provided
            if (value.website && !/^https?:\/\/.+/.test(value.website)) {
              throw new Error('Contact website must be a valid URL');
            }
          }
        }
      }
    },
    social_links: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isValidSocialLinks(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Social links must be a valid JSON object');
          }
          if (value) {
            const allowedPlatforms = ['github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'portfolio'];
            const providedPlatforms = Object.keys(value);
            const invalidPlatforms = providedPlatforms.filter(platform => !allowedPlatforms.includes(platform));
            if (invalidPlatforms.length > 0) {
              throw new Error(`Invalid social platforms: ${invalidPlatforms.join(', ')}`);
            }
            // Validate URLs
            Object.entries(value).forEach(([platform, url]) => {
              if (url && !/^https?:\/\/.+/.test(url)) {
                throw new Error(`${platform} URL must be a valid URL`);
              }
            });
          }
        }
      }
    }
  }, {
    tableName: 'profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  Profile.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  // Class methods
  Profile.findByUserId = async function(userId) {
    return await this.findOne({
      where: { user_id: userId }
    });
  };

  Profile.prototype.updateProfile = async function(updateData) {
    const allowedFields = ['name', 'avatar', 'bio', 'contact', 'social_links'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return await this.update(filteredData);
  };

  return Profile;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const About = sequelize.define('About', {
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
    introduction: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Introduction is required'
        },
        len: {
          args: [1, 5000],
          msg: 'Introduction must be between 1 and 5000 characters'
        }
      }
    },
    highlights: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidHighlights(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Highlights must be an array');
          }
          if (value && value.length > 0) {
            value.forEach((highlight, index) => {
              if (typeof highlight !== 'string') {
                throw new Error(`Highlight at index ${index} must be a string`);
              }
              if (highlight.length === 0 || highlight.length > 200) {
                throw new Error(`Highlight at index ${index} must be between 1 and 200 characters`);
              }
            });
          }
        }
      }
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Image must be a valid URL'
        }
      }
    }
  }, {
    tableName: 'about',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  About.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  // Class methods
  About.findByUserId = async function(userId) {
    return await this.findOne({
      where: { user_id: userId }
    });
  };

  About.prototype.updateAbout = async function(updateData) {
    const allowedFields = ['introduction', 'highlights', 'image'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return await this.update(filteredData);
  };

  return About;
};
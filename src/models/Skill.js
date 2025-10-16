const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Skill = sequelize.define('Skill', {
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
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Skill name is required'
        },
        len: {
          args: [1, 255],
          msg: 'Skill name must be between 1 and 255 characters'
        }
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Level must be an integer'
        },
        min: {
          args: [1],
          msg: 'Level must be at least 1'
        },
        max: {
          args: [100],
          msg: 'Level cannot exceed 100'
        }
      }
    },
    icon: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'Category must not exceed 100 characters'
        }
      }
    }
  }, {
    tableName: 'skills',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Skill;
};
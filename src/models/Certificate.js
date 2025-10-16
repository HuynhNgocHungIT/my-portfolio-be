const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certificate = sequelize.define('Certificate', {
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Certificate title is required'
        },
        len: {
          args: [1, 255],
          msg: 'Certificate title must be between 1 and 255 characters'
        }
      }
    },
    issuer: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Certificate issuer is required'
        },
        len: {
          args: [1, 255],
          msg: 'Certificate issuer must be between 1 and 255 characters'
        }
      }
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Issue date is required'
        },
        isDate: {
          msg: 'Issue date must be a valid date'
        },
        isNotFuture(value) {
          if (new Date(value) > new Date()) {
            throw new Error('Issue date cannot be in the future');
          }
        }
      }
    },
    credential_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Credential URL must be a valid URL'
        }
      }
    },
    icon: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'certificates',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Certificate;
};
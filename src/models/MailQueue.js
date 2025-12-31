const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const MailQueue = sequelize.define('MailQueue', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Recipient email is required'
        },
        isEmail: {
          msg: 'Recipient must be a valid email address'
        }
      }
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Email subject is required'
        },
        len: {
          args: [1, 500],
          msg: 'Email subject must be between 1 and 500 characters'
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Email message is required'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'processing', 'sent', 'failed']],
          msg: 'Status must be one of: pending, processing, sent, failed'
        }
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Priority must be an integer'
        },
        min: {
          args: [0],
          msg: 'Priority must be 0 or greater'
        }
      }
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Attempts must be an integer'
        },
        min: {
          args: [0],
          msg: 'Attempts must be 0 or greater'
        }
      }
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        isInt: {
          msg: 'Max attempts must be an integer'
        },
        min: {
          args: [1],
          msg: 'Max attempts must be at least 1'
        }
      }
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'ohrm_mail_queue',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Instance methods
  MailQueue.prototype.markAsSent = function() {
    this.status = 'sent';
    this.sent_at = new Date();
    return this.save();
  };

  MailQueue.prototype.markAsFailed = function(errorMessage) {
    this.status = 'failed';
    this.error_message = errorMessage;
    this.attempts += 1;
    return this.save();
  };

  MailQueue.prototype.incrementAttempts = function() {
    this.attempts += 1;
    if (this.attempts >= this.max_attempts) {
      this.status = 'failed';
    }
    return this.save();
  };

  // Class methods
  MailQueue.findPending = async function(limit = 100) {
    return await this.findAll({
      where: {
        status: 'pending',
        [Op.or]: [
          { scheduled_at: null },
          { scheduled_at: { [Op.lte]: new Date() } }
        ]
      },
      order: [
        ['priority', 'DESC'],
        ['created_at', 'ASC']
      ],
      limit
    });
  };

  return MailQueue;
};

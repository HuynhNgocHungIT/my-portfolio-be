'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ohrm_mail_queue', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      recipient: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email address of the recipient'
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Email subject line'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Email message content (HTML or plain text)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'sent', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Email processing status'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Email priority (higher number = higher priority)'
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of sending attempts'
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Maximum number of sending attempts'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if sending failed'
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Scheduled sending time (null = send immediately)'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when email was successfully sent'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Additional metadata (e.g., feedback request ID, user ID, etc.)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('ohrm_mail_queue', ['recipient'], {
      name: 'ohrm_mail_queue_recipient_index'
    });

    await queryInterface.addIndex('ohrm_mail_queue', ['status'], {
      name: 'ohrm_mail_queue_status_index'
    });

    await queryInterface.addIndex('ohrm_mail_queue', ['scheduled_at'], {
      name: 'ohrm_mail_queue_scheduled_at_index'
    });

    await queryInterface.addIndex('ohrm_mail_queue', ['priority', 'status'], {
      name: 'ohrm_mail_queue_priority_status_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ohrm_mail_queue');
  }
};

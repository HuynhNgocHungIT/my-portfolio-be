'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certificates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      issuer: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      credential_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('certificates', ['user_id']);
    await queryInterface.addIndex('certificates', ['issue_date']);
    await queryInterface.addIndex('certificates', ['issuer']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificates');
  }
};
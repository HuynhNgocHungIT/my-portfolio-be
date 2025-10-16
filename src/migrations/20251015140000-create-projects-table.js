'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      link: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'active'
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

    // Add CHECK constraint for status enum
    await queryInterface.addConstraint('projects', {
      fields: ['status'],
      type: 'check',
      name: 'projects_status_check',
      where: {
        status: ['active', 'completed', 'archived']
      }
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('projects', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'projects_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('projects', ['user_id'], {
      name: 'projects_user_id_index'
    });

    await queryInterface.addIndex('projects', ['status'], {
      name: 'projects_status_index'
    });

    await queryInterface.addIndex('projects', ['created_at'], {
      name: 'projects_created_at_index'
    });

    await queryInterface.addIndex('projects', ['title'], {
      name: 'projects_title_index'
    });

    // Add GIN index for JSONB tags field for better search performance
    await queryInterface.addIndex('projects', ['tags'], {
      name: 'projects_tags_gin_index',
      using: 'gin'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');
  }
};
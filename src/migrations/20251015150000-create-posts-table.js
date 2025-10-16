'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
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
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cover_image: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'draft'
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addConstraint('posts', {
      fields: ['status'],
      type: 'check',
      name: 'posts_status_check',
      where: {
        status: ['draft', 'published']
      }
    });

    // Add CHECK constraint for views to ensure non-negative values
    await queryInterface.addConstraint('posts', {
      fields: ['views'],
      type: 'check',
      name: 'posts_views_check',
      where: {
        views: {
          [Sequelize.Op.gte]: 0
        }
      }
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('posts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'posts_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('posts', ['user_id'], {
      name: 'posts_user_id_index'
    });

    await queryInterface.addIndex('posts', ['status'], {
      name: 'posts_status_index'
    });

    await queryInterface.addIndex('posts', ['published_at'], {
      name: 'posts_published_at_index'
    });

    await queryInterface.addIndex('posts', ['created_at'], {
      name: 'posts_created_at_index'
    });

    await queryInterface.addIndex('posts', ['title'], {
      name: 'posts_title_index'
    });

    // Add GIN index for JSONB tags field for better search performance
    await queryInterface.addIndex('posts', ['tags'], {
      name: 'posts_tags_gin_index',
      using: 'gin'
    });

    // Add composite index for published posts queries
    await queryInterface.addIndex('posts', ['status', 'published_at'], {
      name: 'posts_status_published_at_index'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};
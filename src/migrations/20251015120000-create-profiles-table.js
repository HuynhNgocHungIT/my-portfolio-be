'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      avatar: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contact: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      social_links: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
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

    // Add unique constraint on user_id (one profile per user)
    await queryInterface.addConstraint('profiles', {
      fields: ['user_id'],
      type: 'unique',
      name: 'profiles_user_id_unique'
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('profiles', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'profiles_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('profiles', ['user_id'], {
      name: 'profiles_user_id_index',
      unique: true
    });

    await queryInterface.addIndex('profiles', ['name'], {
      name: 'profiles_name_index'
    });

    await queryInterface.addIndex('profiles', ['created_at'], {
      name: 'profiles_created_at_index'
    });

    // Add GIN indexes for JSONB fields for better search performance
    await queryInterface.addIndex('profiles', ['contact'], {
      name: 'profiles_contact_gin_index',
      using: 'gin'
    });

    await queryInterface.addIndex('profiles', ['social_links'], {
      name: 'profiles_social_links_gin_index',
      using: 'gin'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('profiles');
  }
};
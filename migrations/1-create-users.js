'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        noUpdate: true
      },
      _ref: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      name: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      profile_picture: {
        type: Sequelize.UUID
      },
      alerts_activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      alert_radius: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => {
      queryInterface.addConstraint('users', {
        type: 'foreign key',
        fields: ['profile_picture'],
        name: 'fk_photos_users_profile_picture',
        references: {
          table: 'photos',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notices', {
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
      pet_id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      user_id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      notice_type: {
        type: Sequelize.STRING
      },
      event_location_lat: {
        type: Sequelize.STRING
      },
      event_location_long: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      event_timestamp: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      queryInterface.addConstraint('notices', {
        type: 'foreign key',
        fields: ['pet_id'],
        name: 'fk_notices_pets_pet_id',
        references: {
          table: 'pets',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
    }).then(() => {
      queryInterface.addConstraint('notices', {
        type: 'foreign key',
        fields: ['user_id'],
        name: 'fk_notices_users_user_id',
        references: {
          table: 'users',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notices');
  }
};
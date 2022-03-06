'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pets', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        noUpdate: true
      },
      _ref: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      fur_color: {
        type: Sequelize.STRING //TBD: if this is going to be an array should we have a predefined list of colors to help the search? Otherwise, this should just be a string/text field
      },
      right_eye_color: {
        type: Sequelize.STRING //Same as with the fur color
      },
      left_eye_color: {
        type: Sequelize.STRING
      },
      breed: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.STRING
      },
      life_stage: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      sex: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
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
      queryInterface.addConstraint('pets', {
        type: 'foreign key',
        fields: ['user_id'],
        name: 'fk_pets_users_user_id',
        references: {
          table: 'users',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pets');
  }
};
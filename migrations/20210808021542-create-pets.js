'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Pets', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      furColor: {
        type: Sequelize.STRING //TBD: if this is going to be an array should we have a predefined list of colors to help the search? Otherwise, this should just be a string/text field
      },
      rightEyeColor: {
        type: Sequelize.STRING //Same as with the fur color
      },
      leftEyeColor: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.STRING
      },
      lifeStage: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      sex: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.UUID
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
      queryInterface.addConstraint('Pets', {
        type: 'foreign key',
        fields: ['userId'],
        name: 'fk_pets_users_userId',
        references: {
          table: 'Users',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Pets');
  }
};
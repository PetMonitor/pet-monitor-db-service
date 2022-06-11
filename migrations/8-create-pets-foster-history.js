'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PetsFosterHistory', {
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
      petId: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      contactEmail: Sequelize.STRING,
      contactPhone: Sequelize.STRING,
      contactName: Sequelize.STRING,
      sinceDate: Sequelize.DATE,
      untilDate: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }).then(() => {
      queryInterface.addConstraint('PetsFosterHistory', {
        type: 'foreign key',
        fields: ['petId'],
        name: 'fk_pets_foster_history_pets_petId',
        references: {
          table: 'Pets',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PetsFosterHistory');
  }
};

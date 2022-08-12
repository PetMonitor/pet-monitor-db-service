'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PetTransfers', {
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
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      transferFromUser: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      transferToUser: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      activeFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      activeUntil: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancelled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      completedOn: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }).then(() => {
      queryInterface.addConstraint('PetTransfers', {
        type: 'foreign key',
        fields: ['petId'],
        name: 'fk_petTransfer_pets_petId',
        references: {
          table: 'Pets',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    }).then(() => {
        queryInterface.addConstraint('PetTransfers', {
          type: 'foreign key',
          fields: ['transferToUser'],
          name: 'fk_petTransfer_users_transferToUser',
          references: {
            table: 'Users',
            field: 'uuid'
          },
          onDelete: 'cascade',
          onUpdate: 'no action',
        })
    }).then(() => {
      queryInterface.addConstraint('PetTransfers', {
        type: 'foreign key',
        fields: ['transferFromUser'],
        name: 'fk_petTransfer_users_transferFromUser',
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
    await queryInterface.dropTable('PetTransfers');
  }
};
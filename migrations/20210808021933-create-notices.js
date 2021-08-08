'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notices', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      noticeType: {
        type: Sequelize.STRING
      },
      eventLocation: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      eventTimestamp: {
        type: Sequelize.STRING
      },
      petId: {
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
      queryInterface.addConstraint('Notices', {
        type: 'foreign key',
        fields: ['petId'],
        name: 'fk_notices_pets_petId',
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
    await queryInterface.dropTable('Notices');
  }
};
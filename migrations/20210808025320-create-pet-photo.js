'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('petPhotos', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      petId: {
        type: Sequelize.UUID
      },
      photoId: {
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
      queryInterface.addConstraint('petPhotos', {
        type: 'foreign key',
        fields: ['petId'],
        name: 'fk_pets_petPhotos_petId',
        references: {
          table: 'Pets',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    }).then(() => {
      queryInterface.addConstraint('petPhotos', {
        type: 'foreign key',
        fields: ['photoId'],
        name: 'fk_photos_petPhotos_photoId',
        references: {
          table: 'Photos',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('petPhotos');
  }
};
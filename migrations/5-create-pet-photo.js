'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PetPhotos', {
      petId: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        noUpdate: true
      },
      photoId: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        noUpdate: true
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
      queryInterface.addConstraint('PetPhotos', {
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
      queryInterface.addConstraint('PetPhotos', {
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
    await queryInterface.dropTable('PetPhotos');
  }
};
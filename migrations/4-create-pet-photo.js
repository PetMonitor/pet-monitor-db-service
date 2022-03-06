'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pet_photos', {
      pet_id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        noUpdate: true
      },
      photo_id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        noUpdate: true
      },
      embedding: {
        primaryKey: false,
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        defaultValue: []
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
      queryInterface.addConstraint('pet_photos', {
        type: 'foreign key',
        fields: ['pet_id'],
        name: 'fk_pets_petPhotos_pet_id',
        references: {
          table: 'pets',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    }).then(() => {
      queryInterface.addConstraint('pet_photos', {
        type: 'foreign key',
        fields: ['photo_id'],
        name: 'fk_photos_petPhotos_photo_id',
        references: {
          table: 'photos',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pet_photos');
  }
};
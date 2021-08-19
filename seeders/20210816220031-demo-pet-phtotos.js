'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PetPhotos', [
      {
        petId: '123e4567-e89b-12d3-a456-426614174001',
        photoId: '123e4567-e89b-12d3-a456-556614174001'
      },
      {
        petId: '123e4567-e89b-12d3-a456-426614174002',
        photoId: '123e4567-e89b-12d3-a456-556614174002'
      }, 
      {
        petId: '123e4567-e89b-12d3-a456-426614174003',
        photoId: '123e4567-e89b-12d3-a456-556614174003'
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PetPhotos', null, {});
  }
};
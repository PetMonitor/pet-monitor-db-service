'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Notices', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614175555',
        _ref: 'cfdc6ee2-5c26-41dc-83f8-3ba40bae2df0',
        petId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        noticeType: 'LOST',
        eventLocationLat: '123',
        eventLocationLong: '345',
        description: 'My pet is lost! Please help!',
        eventTimestamp: '2021-08-16T02:34:46+00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614176666',
        _ref: 'bd6fbdce-e742-4ed4-8470-3c1703aaaf8f',
        petId: '123e4567-e89b-12d3-a456-426614174002',
        userId: '123e4567-e89b-12d3-a456-426614175000',
        noticeType: 'FOUND',
        eventLocationLat: '123',
        eventLocationLong: '345',
        description: 'I found this lovely dog!',
        eventTimestamp: '2021-08-16T02:34:46+00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Notices', null, {});
  }
};
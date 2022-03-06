'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('notices', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614175555',
        _ref: 'cfdc6ee2-5c26-41dc-83f8-3ba40bae2df0',
        pet_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        notice_type: 'LOST',
        event_location_lat: '123',
        event_location_long: '345',
        description: 'My pet is lost! Please help!',
        event_timestamp: '2021-08-16T02:34:46+00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614176666',
        _ref: 'bd6fbdce-e742-4ed4-8470-3c1703aaaf8f',
        pet_id: '123e4567-e89b-12d3-a456-426614174002',
        user_id: '123e4567-e89b-12d3-a456-426614175000',
        notice_type: 'FOUND',
        event_location_lat: '123',
        event_location_long: '345',
        description: 'I found this lovely dog!',
        event_timestamp: '2021-08-16T02:34:46+00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('notices', null, {});
  }
};
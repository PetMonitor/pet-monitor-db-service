'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
        username: 'TerryPratchett',
        password: 'discworld123',
        email: 'terrypratchett@discworld.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614175000',
        _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
        username: 'NeilGaiman',
        password: 'coraline1960',
        email: 'neilgaiman@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

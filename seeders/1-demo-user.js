'use strict';
var passwordHasher = require('../utils/passwordHasher.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
        username: 'TerryPratchett',
        password: passwordHasher('discworld123'),
        email: 'terrypratchett@discworld.com',
        name: 'Terry Pratchett',
        phone_number: '222-000-666',
        profile_picture: '123e4567-e89b-12d3-a456-556614173000',
        alerts_activated: true,
        alert_radius: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614175000',
        _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
        username: 'NeilGaiman',
        password: passwordHasher('coraline1960'),
        email: 'neilgaiman@gmail.com',
        name: 'Neil Gaiman',
        phone_number: '222-000-667',
        profile_picture: '123e4567-e89b-12d3-a456-556614173001',
        alerts_activated: false,
        alert_radius: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};

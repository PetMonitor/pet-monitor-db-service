'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      username: 'TerryPratchett',
      password: 'discworld123',
      email: 'terrypratchett@discworld.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

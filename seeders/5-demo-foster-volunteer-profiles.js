'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('FosterVolunteerProfiles', [
      {
        uuid: 'b4d0e434-7ff3-49cd-a9b6-f367f6922709',
        _ref: 'e15fde75-3713-4684-bb64-a1611f090578',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        petTypesToFoster: ['DOG'],
        petSizesToFoster: ['SMALL', 'MEDIUM'],
        location: 'Palermo',
        province: 'Buenos Aires',
        additionalInformation: 'Tengo un espacio grande, con patio. Vivo con dos perros y un gato.',
        available: true,
        averageRating: 4.25,
        ratingAmount: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('notices', null, {});
  }
};

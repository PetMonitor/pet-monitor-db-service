'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PetsFosterHistory', [
      {
        uuid: '6714d096-be65-49db-ae4d-b5a609ff6382',
        _ref: '979ae5c0-774c-4703-bb9e-164bfaa94cee',
        petId: '123e4567-e89b-12d3-a456-426614174002',
        contactEmail: "roger@gmail.com",
        contactPhone: "12345678",
        contactName: "Roger Harrison",
        sinceDate: new Date(2022, 2, 12),
        untilDate: new Date(2022, 2, 25),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '429e11a9-3783-4bd7-860e-7ea48c76aac7',
        _ref: '71362e47-9987-4f8a-8c7f-8e4593e32b92',
        petId: '123e4567-e89b-12d3-a456-426614174002',
        contactEmail: "pam@gmail.com",
        contactPhone: "112475678",
        contactName: "Pam Jones",
        sinceDate: new Date(2022, 2, 13),
        untilDate: new Date(2022, 3, 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '92398d1b-dd3c-4b54-ae94-eb30e5f71f57',
        _ref: '5ee4095a-f7c1-476a-935c-dc0f917091fd',
        petId: '123e4567-e89b-12d3-a456-426614174002',
        userId: '123e4567-e89b-12d3-a456-426614175000',
        sinceDate: new Date(2022, 3, 12),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PetsFosterHistory', null, {});
  }
};

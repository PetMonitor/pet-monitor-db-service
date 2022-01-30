'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Pets', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        _ref: 'db7f4d26-6c2b-4d8a-9eee-3a003cbc5311',
        type: 'DOG',
        name: 'firulais',
        furColor: 'brown',
        rightEyeColor: 'black',
        leftEyeColor: 'black',
        size: 'SMALL',
        lifeStage: 'ADULT',
        age: 8,
        sex: 'MALE',
        breed: 'crossbreed',
        description: 'a very nice dog',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        _ref: '12da5e0f-802f-432d-872f-a48e8297d247',
        type: 'DOG',
        name: 'blondie',
        furColor: 'blonde',
        rightEyeColor: 'blue', 
        leftEyeColor: 'gray',
        size: 'MEDIUM',
        lifeStage: 'BABY',
        age: null,
        sex: 'FEMALE',
        breed: 'crossbreed',
        description: 'likes to chew furniture',
        userId: '123e4567-e89b-12d3-a456-426614175000',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        uuid: '123e4567-e89b-12d3-a456-426614174003',
        _ref: 'ad838f7f-ac53-4723-aaae-536dc44f2b62',
        type: 'CAT',
        name: 'yuli',
        furColor: 'white and orange',
        rightEyeColor: 'brown',
        leftEyeColor: 'brown',
        size: 'SMALL',
        lifeStage: 'ADULT',
        age: 6,
        sex: 'FEMALE',
        breed: 'crossbreed',
        description: 'she likes to chase mice',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Pets', null, {});
  }
};

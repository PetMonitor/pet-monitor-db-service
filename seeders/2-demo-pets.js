'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('pets', [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        _ref: 'db7f4d26-6c2b-4d8a-9eee-3a003cbc5311',
        type: 'DOG',
        name: 'firulais',
        fur_color: 'brown',
        right_eye_color: 'black',
        left_eye_color: 'black',
        size: 'SMALL',
        life_stage: 'ADULT',
        age: 8,
        sex: 'MALE',
        breed: 'crossbreed',
        description: 'a very nice dog',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        _ref: '12da5e0f-802f-432d-872f-a48e8297d247',
        type: 'DOG',
        name: 'blondie',
        fur_color: 'blonde',
        right_eye_color: 'blue', 
        left_eye_color: 'gray',
        size: 'MEDIUM',
        life_stage: 'BABY',
        age: null,
        sex: 'FEMALE',
        breed: 'crossbreed',
        description: 'likes to chew furniture',
        user_id: '123e4567-e89b-12d3-a456-426614175000',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        uuid: '123e4567-e89b-12d3-a456-426614174003',
        _ref: 'ad838f7f-ac53-4723-aaae-536dc44f2b62',
        type: 'CAT',
        name: 'yuli',
        fur_color: 'white and orange',
        right_eye_color: 'brown',
        left_eye_color: 'brown',
        size: 'SMALL',
        life_stage: 'ADULT',
        age: 6,
        sex: 'FEMALE',
        breed: 'crossbreed',
        description: 'she likes to chase mice',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('pets', null, {});
  }
};

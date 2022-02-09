'use strict';

var fs = require('fs');
const imageContent = fs.readFileSync('./seeders/resources/dogImage.txt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Photos', [
      {
        uuid: '123e4567-e89b-12d3-a456-556614173000',
        photo: Buffer.from(imageContent, "base64"),
        lowResPhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614173001',
        photo: Buffer.from(imageContent, "base64"),
        lowResPhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174001',
        photo: Buffer.from(imageContent, "base64"),
        lowResPhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174002',
        photo: Buffer.from(imageContent, "base64"),
        lowResPhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        uuid: '123e4567-e89b-12d3-a456-556614174003',
        photo: Buffer.from(imageContent, "base64"),
        lowResPhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Photos', null, {});
  }
};
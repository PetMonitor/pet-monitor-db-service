'use strict';

var sharp = require('sharp');
var fs = require('fs');
let buffer = fs.readFileSync('./seeders/resources/dogImage.json');
const imageContent = Buffer.from(JSON.parse(buffer).image, 'base64');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log(imageContent)

    return queryInterface.bulkInsert('Photos', [
      {
        uuid: '123e4567-e89b-12d3-a456-556614173000',
        photo: imageContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614173001',
        photo: imageContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174001',
        photo: imageContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174002',
        photo: imageContent,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        uuid: '123e4567-e89b-12d3-a456-556614174003',
        photo: imageContent,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Photos', null, {});
  }
};
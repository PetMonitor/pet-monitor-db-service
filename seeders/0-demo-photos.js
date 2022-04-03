'use strict';

var sharp = require('sharp');
var fs = require('fs');
let buffer = fs.readFileSync('./seeders/resources/dogImage.json');
const imageContent = Buffer.from(JSON.parse(buffer).image, 'base64');
const LOW_RES_PHOTO_DIMENSION = 130;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log(imageContent)
    const imageLowContent = await sharp(imageContent)
        .resize(LOW_RES_PHOTO_DIMENSION, LOW_RES_PHOTO_DIMENSION)
        .toBuffer();

    return queryInterface.bulkInsert('Photos', [
      {
        uuid: '123e4567-e89b-12d3-a456-556614173000',
        photo: imageContent,
        lowResPhoto: imageLowContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614173001',
        photo: imageContent,
        lowResPhoto: imageLowContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174001',
        photo: imageContent,
        lowResPhoto: imageLowContent,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: '123e4567-e89b-12d3-a456-556614174002',
        photo: imageContent,
        lowResPhoto: imageLowContent,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        uuid: '123e4567-e89b-12d3-a456-556614174003',
        photo: imageContent,
        lowResPhoto: imageLowContent,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Photos', null, {});
  }
};
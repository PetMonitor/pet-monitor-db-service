const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');

TEST_SEPARATOR = '=====================================================================';

USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@discworld.com',
      password: 'discworld123'
    },
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com',
      password: 'goodOmens2022'
    }
  ]

EXPECTED_PETS = [
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
          photos: []
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
          photos: []
        }
  ]

describe('Pets test case', function() {

  this.beforeEach('Before pets test', function() {
    // Re-initialize database
    return db.Users.bulkCreate(USERS)
        .then((res) => {
          console.log(`TEST LOG: Successfully created user records ${res}`);
          return db.Pets.bulkCreate(EXPECTED_PETS)
          .then((res) => {
            console.log(`TEST LOG: Successfully created pet records ${res}`);
            console.log(TEST_SEPARATOR)
          })
          .catch(err => {
            console.error(`TEST LOG: Error creating pet records ${err}`);
            console.log(TEST_SEPARATOR)
          });
        })
        .catch(err => {
          console.error(`TEST LOG: Error creating user records ${err}`);
          console.log(TEST_SEPARATOR)
        });
    });

    this.afterEach('After pets test', function() {
        // Clean database
        return db.Users.destroy({
              where: {},
              force: true,
            })
            .then(() => {
              console.log(`TEST LOG: Successfully deleted all records from Users table.`);
              db.Pets.destroy({
                where: {},
                force: true,
              }).then(() => {
                console.log(`TEST LOG: Successfully deleted all records from Pets table.`);
                console.log(TEST_SEPARATOR)
              }).catch(err => {
                console.error(`TEST LOG: Error deleting all records from Pets table ${err}`);
                console.log(TEST_SEPARATOR)
              });
            }).catch(err => {
              console.error(`TEST LOG: Error deleting all records from Users table ${err}`);
              console.log(TEST_SEPARATOR)
            });
    });


    it('Get all user pets endpoint returns all pets for that user', async () => {

        USER_PETS = [ EXPECTED_PETS[0] ]

        await request(server)
        .get('/users/123e4567-e89b-12d3-a456-426614174000/pets')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
            console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
            expect(response.body).to.have.deep.members(USER_PETS)
        });
    });

    //TODO: Get pet by id test (also test photos join)
    //TODO: Create pets test
    //TODO: Update pet test
    //TODO: Delete pet test

});
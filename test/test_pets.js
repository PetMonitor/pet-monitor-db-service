const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');
const nock = require('nock');

TEST_SEPARATOR = '=====================================================================';

USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@discworld.com',
      password: 'discworld123',
      name: 'Terry Pratchett',
      phoneNumber: '222-000-666',
      alertsActivated: true,
      alertRadius: 1
    },
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com',
      password: 'goodOmens2022',
      name: 'Neil Gaiman',
      phoneNumber: '222-000-777',
      alertsActivated: true,
      alertRadius: 1,
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

  this.beforeEach('Before pets test', async function() {
    // Re-initialize database
    await db.Users.bulkCreate(USERS)
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

    this.afterEach('After pets test', async function() {
        // Clean database
        await db.Users.destroy({
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

        await db.PetPhotos.destroy({
          where: {},
          force: true,
        });

        await db.Photos.destroy({
          where: {},
          force: true,
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
            //console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
            expect(response.body).to.have.deep.members(USER_PETS)
        });
    });

    it('Get all user pets by id returns specific pet', async () => {
      await request(server)
      .get('/users/123e4567-e89b-12d3-a456-426614174000/pets/123e4567-e89b-12d3-a456-426614174001')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
          expect(response.body).to.deep.equal(EXPECTED_PETS[0])
      });
    });

    it('Create pet endpoint creates new pet', async () => {
      const NEW_PET = {
        uuid: '09c8d976-7f05-43ea-8016-8c7d2cd7d302',
        _ref: 'dbdeaa55-2d03-4ca4-9de2-f587c9b11edc',
        type: 'CAT',
        name: 'greebo',
        furColor: 'grey',
        breed: 'persian',
        size: 'LARGE',
        lifeStage: 'ADULT',
        sex: 'MALE',
        description: "Greebo is nanny's cat",
        photos: []
      }

      const EXPECTED_PET = Object.assign({}, NEW_PET);
      delete EXPECTED_PET['photos']

      await request(server)
        .post('/users/123e4567-e89b-12d3-a456-426614174000/pets')
        .set('Accept', 'application/json')
        .send(NEW_PET)
        .expect('Content-Type', /json/)
        .expect(201);

      const pet = await db.Pets.findOne({ 
          where: { 
            uuid: NEW_PET.uuid, 
            userId: '123e4567-e89b-12d3-a456-426614174000'
          }
      });  

      expect(pet).to.include(EXPECTED_PET);
      
    });

    it('Create pet endpoint creates new pet with photos', async () => {

      const PHOTO = { 'uuid':'44d26749-c3d7-4b12-975d-40811014acd0', 'photo':'someBase64Img' } ;

      const NEW_PET = {
        uuid: '09c8d976-7f05-43ea-8016-8c7d2cd7d302',
        _ref: 'dbdeaa55-2d03-4ca4-9de2-f587c9b11edc',
        type: 'CAT',
        name: 'greebo',
        furColor: 'grey',
        breed: 'persian',
        size: 'LARGE',
        lifeStage: 'ADULT',
        sex: 'MALE',
        description: "Greebo is nanny's cat",
        photos: [ PHOTO ]
      }

      const mockEmbedding = new Array(128);
      mockEmbedding.fill(0);

      const scope = nock('http://host.docker.internal:5001')
        .post('/api/v0/dogs/embedding')
        .reply((uri, requestBody) => {
          return [
            201, 
            {
              embeddings: {
                  '44d26749-c3d7-4b12-975d-40811014acd0': mockEmbedding
                }
            },
          ]
        })

      const EXPECTED_PET = Object.assign({}, NEW_PET);
      delete EXPECTED_PET['photos']

      await request(server)
        .post('/users/123e4567-e89b-12d3-a456-426614174000/pets')
        .set('Accept', 'application/json')
        .send(NEW_PET)
        .expect('Content-Type', /json/)
        .expect(201);

      const pet = await db.Pets.findOne({ 
          where: { 
            uuid: NEW_PET.uuid, 
            userId: '123e4567-e89b-12d3-a456-426614174000'
          }
      });  

      
      const petPhoto = await db.PetPhotos.findOne({ 
          where: { 
            petId: NEW_PET.uuid, 
            photoId: PHOTO.uuid
          }
      });  

      const photo = await db.Photos.findOne({ 
          where: { 
            uuid: PHOTO.uuid
          }
      });  


      expect(pet).to.include(EXPECTED_PET);
      expect(petPhoto).to.include({ petId: NEW_PET.uuid, photoId: PHOTO.uuid });
      expect(photo).to.include({ uuid: PHOTO.uuid });
      expect(photo.photo).to.not.be.null;


    });


    //TODO: Update pet test

    it('Delete pet removes pet from database', async () => {
      await request(server)
        .delete('/users/123e4567-e89b-12d3-a456-426614174000/pets/123e4567-e89b-12d3-a456-426614174001')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      const pets = await db.Pets.findOne({ 
          where: { 
            uuid: '123e4567-e89b-12d3-a456-426614174001', 
            userId: '123e4567-e89b-12d3-a456-426614174000'
          }
      });

      expect(pets).to.be.a('null');
    });
});
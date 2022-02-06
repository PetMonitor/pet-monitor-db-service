const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');
var passwordHasher = require('../utils/passwordHasher.js');
var fs = require('fs');

TEST_SEPARATOR = '=====================================================================';

USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@discworld.com',
      password: passwordHasher('discworld123'),
      name: 'Terry Pratchett',
      phoneNumber: '222-000-666',
      profilePicture: null,
      alertsActivated: true,
      alertRadius: 1
    },
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com',
      password: passwordHasher('goodOmens2022'),
      name: 'Neil Gaiman',
      phoneNumber: '222-000-777',
      profilePicture: null,
      alertsActivated: true,
      alertRadius: 1,
    }
]

PETS = [
  {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    _ref: 'db7f4d26-6c2b-4d8a-9eee-3a003cbc5311',
    type: 'DOG',
    name: 'firulais',
    furColor: 'brown',
    size: 'SMALL',
    lifeStage: 'ADULT',
    sex: 'MALE',
    breed: 'crossbreed',
    description: 'a very nice dog'
  },
  {
    uuid: '123e4567-e89b-12d3-a456-426614174002',
    _ref: '12da5e0f-802f-432d-872f-a48e8297d247',
    type: 'DOG',
    name: 'blondie',
    furColor: 'blonde',
    size: 'MEDIUM',
    lifeStage: 'BABY',
    sex: 'FEMALE',
    breed: 'crossbreed',
    description: 'likes to chew furniture'
  }
]

const IMAGE_CONTENT = fs.readFileSync('./seeders/resources/dogImage.txt', 'base64');

PHOTOS = [
  {
    uuid: '126e4567-e89b-12d3-a456-426614176001',
    photo: IMAGE_CONTENT
  },
  {
    uuid: '126e4567-e89b-12d3-a456-426614176002',
    photo: IMAGE_CONTENT
  },
  {
    uuid: '126e4567-e89b-12d3-a456-426614176003',
    photo: IMAGE_CONTENT
  }
]



describe('Users test case', function() {

  this.beforeEach('Before users test', async function() {
    // Re-initialize database
    await db.Users.bulkCreate(USERS)
          .then((res) => {
            console.log('Created test users');
            // console.log(`BEFORE TEST LOG: Successfully created user records ${res}`);
            console.log(TEST_SEPARATOR)
          })
          .catch(err => {
            console.error(`BEFORE TEST LOG: Error creating user records ${err}`);
          });

  });

  this.afterEach('After users test', async function() {
    // Clean database
    await db.Users.destroy({
          where: {},
          force: true,
        }).then(() => {
          // console.log(`AFTER TEST LOG: Successfully deleted all records from Users table.`);
          console.log(TEST_SEPARATOR)
        })
        .catch(err => {
          console.error(`AFTER TEST LOG: Error deleting all records from Users table ${err}`);
          console.log(TEST_SEPARATOR)
        });
  });

  it('Get all users endpoint returns all users', async () => {
    EXPECTED_USERS = []

    USERS.forEach(function(user, index, array) {
      EXPECTED_USER = Object.assign({}, user);
      delete EXPECTED_USER['password']
      EXPECTED_USERS.push(EXPECTED_USER)
    });

    await request(server)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.have.deep.members(EXPECTED_USERS)
      });
  });

  it('Post user endpoint creates new user', async () => {
    NEW_USER = {
      uuid: '123e4567-e89b-12d3-a456-426614176000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c57860833',
      username: 'IanMcEwan',
      email: 'ianmcewan@gmail.com',
      password: 'atonement456',
      pets: []
    }

    EXPECTED_USER = Object.assign({}, NEW_USER);
    delete EXPECTED_USER['pets']

    console.log('Starting test create user')
    await request(server)
      .post('/users')
      .set('Accept', 'application/json')
      .send(NEW_USER)
      .expect('Content-Type', /json/)
      .expect(201);

    EXPECTED_USER['password'] = passwordHasher(NEW_USER['password']);
    
    const users = await db.Users.findByPk('123e4567-e89b-12d3-a456-426614176000', {
      attributes: ['uuid', '_ref', 'username', 'email', 'password']
    });

    console.log(`TEST LOG: Response was ${JSON.stringify(users)}`);
    expect(users['dataValues']).to.deep.equal(EXPECTED_USER);
  });

  it('Post user endpoint creates new user with pets', async () => {
    NEW_PET_0 = Object.assign({}, PETS[0])
    NEW_PET_1 = Object.assign({}, PETS[1])

    NEW_PET_0['photos'] = []
    NEW_PET_1['photos'] = []

    NEW_USER = {
      uuid: '123e4567-e89b-12d3-a456-426614176000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c57860833',
      username: 'IanMcEwan',
      email: 'ianmcewan@gmail.com',
      password: 'atonement456',
      pets: [ NEW_PET_0, NEW_PET_1 ]
    }

    EXPECTED_USER = Object.assign({}, NEW_USER);
    delete EXPECTED_USER['pets']

    console.log('Starting test create user')
    await request(server)
      .post('/users')
      .set('Accept', 'application/json')
      .send(NEW_USER)
      .expect('Content-Type', /json/)
      .expect(201);

    EXPECTED_USER['password'] = passwordHasher(NEW_USER['password']);
    
    const users = await db.Users.findByPk(NEW_USER['uuid'], {
      attributes: ['uuid', '_ref', 'username', 'email', 'password']
    });

    const pet0 = await db.Pets.findByPk(PETS[0]['uuid'], {
      attributes: ['uuid', '_ref', 'type', 'name', 'furColor', 'size', 'lifeStage', 'sex', 'breed', 'description']
    });

    const pet1 = await db.Pets.findByPk(PETS[1]['uuid'], {
      attributes: ['uuid', '_ref', 'type', 'name', 'furColor', 'size', 'lifeStage', 'sex', 'breed', 'description']
    });

    console.log(`TEST LOG: Response was ${JSON.stringify(users)}`);
    expect(users['dataValues']).to.deep.equal(EXPECTED_USER);
    expect(pet0['dataValues']).to.deep.equal(PETS[0]);
    expect(pet1['dataValues']).to.deep.equal(PETS[1]);

  });

  it('Post user endpoint creates new user with pets and pet photos', async () => {

    NEW_PET_0 = Object.assign({}, PETS[0])
    NEW_PET_1 = Object.assign({}, PETS[1])

    NEW_PET_0['photos'] = [ PHOTOS[0] ]
    NEW_PET_1['photos'] = [ PHOTOS[1], PHOTOS[2] ]

    NEW_USER = {
      uuid: '123e4567-e89b-12d3-a456-426614176000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c57860833',
      username: 'IanMcEwan',
      email: 'ianmcewan@gmail.com',
      password: 'atonement456',
      pets: [ NEW_PET_0, NEW_PET_1 ]
    }

    EXPECTED_USER = Object.assign({}, NEW_USER);
    delete EXPECTED_USER['pets']

    console.log('Starting test create user')
    await request(server)
      .post('/users')
      .set('Accept', 'application/json')
      .send(NEW_USER)
      .expect('Content-Type', /json/)
      .expect(201);

    EXPECTED_USER['password'] = passwordHasher(NEW_USER['password']);
    
    const users = await db.Users.findByPk(NEW_USER['uuid'], {
      attributes: ['uuid', '_ref', 'username', 'email', 'password']
    });

    const pet0 = await db.Pets.findByPk(PETS[0]['uuid'], {
      attributes: ['uuid', '_ref', 'type', 'name', 'furColor', 'size', 'lifeStage', 'sex', 'breed', 'description']
    });

    const pet1 = await db.Pets.findByPk(PETS[1]['uuid'], {
      attributes: ['uuid', '_ref', 'type', 'name', 'furColor', 'size', 'lifeStage', 'sex', 'breed', 'description']
    });


    const photo0 = await db.Photos.findByPk(PHOTOS[0]['uuid'], { attributes: ['uuid', 'photo'] });
    const photo1 = await db.Photos.findByPk(PHOTOS[1]['uuid'], { attributes: ['uuid', 'photo'] });
    const photo2 = await db.Photos.findByPk(PHOTOS[2]['uuid'], { attributes: ['uuid', 'photo'] });

    const pet0Photos = await db.PetPhotos.findAll({ where: { petId: PETS[0]['uuid'] } ,  attributes: ['petId', 'photoId'] });
    const pet1Photos = await db.PetPhotos.findAll({ where: { petId: PETS[1]['uuid'] } ,  attributes: ['petId', 'photoId'] });

    //console.log(`TEST LOG: Response was ${JSON.stringify(users)}`);

    expect(users['dataValues']).to.deep.equal(EXPECTED_USER);

    expect(pet0['dataValues']).to.deep.equal(PETS[0]);
    expect(pet1['dataValues']).to.deep.equal(PETS[1]);

    //Before comparing, field 'photo' must be changed back to base64
    expect(Buffer.from(photo0['dataValues']['photo']).toString('base64')).to.equal(PHOTOS[0]['photo']);
    expect(Buffer.from(photo1['dataValues']['photo']).toString('base64')).to.equal(PHOTOS[1]['photo']); 
    expect(Buffer.from(photo2['dataValues']['photo']).toString('base64')).to.equal(PHOTOS[2]['photo']); 

    expect(pet0Photos[0]['dataValues']['photoId']).to.equal(PHOTOS[0]['uuid']);
    expect(pet0Photos[0]['dataValues']['petId']).to.equal(PETS[0]['uuid']);

    expect(pet1Photos[0]['dataValues']['photoId']).to.equal(PHOTOS[1]['uuid']);
    expect(pet1Photos[0]['dataValues']['petId']).to.equal(PETS[1]['uuid']);

    expect(pet1Photos[1]['dataValues']['photoId']).to.equal(PHOTOS[2]['uuid']);
    expect(pet1Photos[1]['dataValues']['petId']).to.equal(PETS[1]['uuid']);
  });

  /*
  it('Post user endpoint if creation fails then no users or pets are created', async () => {
    
  });*/

});

describe('User by id test case', function() {

  this.beforeEach('Before users test', function() {
    // Re-initialize database
    return db.Users.bulkCreate(USERS)
          .then((res) => {
            console.log(`TEST LOG: Successfully created user records ${res}`);
            console.log(TEST_SEPARATOR)
          })
          .catch(err => {
            console.error(`TEST LOG: Error creating user records ${err}`);
          });

  });

  this.afterEach('After users test', function() {
    // Clean database
    return db.Users.destroy({
          where: {},
          force: true,
        })
        .then(() => {
          console.log(`TEST LOG: Successfully deleted all records from Users table.`);
          console.log(TEST_SEPARATOR)
        })
        .catch(err => {
          console.error(`TEST LOG: Error deleting all records from Users table ${err}`);
          console.log(TEST_SEPARATOR)
        });
  });

  it('Get endpoint retrieves user with specified id', async () => {
    EXPECTED_USER = Object.assign({}, USERS[0]);
    delete EXPECTED_USER['password']

    await request(server)
      .get('/users/123e4567-e89b-12d3-a456-426614174000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.deep.equal(EXPECTED_USER)
      });
  });

  it('Delete endpoint deletes user with specified id', async () => {
    await request(server)
      .delete('/users/123e4567-e89b-12d3-a456-426614174000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body['deletedCount']).to.equal(1)
      });

    return db.Users
      .findAll({ attributes: [ 'uuid', '_ref', 'password', 'username', 'email', 'name', 'phoneNumber',  'profilePicture', 'alertsActivated', 'alertRadius']})
      .then(users => {
        console.log(`TEST LOG: Response was ${JSON.stringify(users)}`)        
        expect(users[0]['dataValues']).to.deep.equal(USERS[1])
      });
  });


  it('Update endpoint updates user with specified id', async () => {

    UPDATED_USER = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@goodomens.com',
      name: 'Terry Pratchett',
      phoneNumber: '222-000-666',
      profilePicture: '126e4567-e89b-12d3-a456-426614176001',
      alertsActivated: true,
      alertRadius: 1
    }

    await request(server)
      .put('/users/123e4567-e89b-12d3-a456-426614174000')
      .set('Accept', 'application/json')
      .send(UPDATED_USER)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body['updatedCount']).to.equal(1)
      });

    await request(server)
      .get('/users/123e4567-e89b-12d3-a456-426614174000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.deep.equal(UPDATED_USER)
      });
  });

  //it('Update with old reference fails', async () => {
  //});

});

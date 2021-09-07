const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');
var passwordHasher = require('../utils/passwordHasher.js');

TEST_SEPARATOR = '=====================================================================';

USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@discworld.com',
      password: passwordHasher('discworld123')
    },
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com',
      password: passwordHasher('goodOmens2022')
    }
  ]

describe('Users test case', function() {

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
      password: 'atonement456'
    }

    await request(server)
      .post('/users')
      .set('Accept', 'application/json')
      .send(NEW_USER)
      .expect('Content-Type', /json/)
      .expect(201);

    NEW_USER['password'] = passwordHasher(NEW_USER['password']);

    return db.Users
      .findByPk('123e4567-e89b-12d3-a456-426614176000', {
        attributes: ['uuid', '_ref', 'username', 'email', 'password']
      })
      .then((users) => {
        console.log(`TEST LOG: Response was ${JSON.stringify(users)}`)
        expect(users['dataValues']).to.deep.equal(NEW_USER)
      });
  });

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
      .findAll({ attributes: ['uuid', '_ref', 'username', 'email', 'password'] })
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
      email: 'terrypratchett@goodomens.com'
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

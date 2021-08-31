const chai = require('chai')
const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');


EXPECTED_USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      _ref: '94aa64c9-b966-4bc0-b422-0830fce1ac5c',
      username: 'TerryPratchett',
      email: 'terrypratchett@discworld.com'
    },
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com'
    }
  ]

describe('Users test case', function() {
    after(function() {
      // Re-initialize database
      db.sequelize.sync()
      .then(() => {
        console.log('Successfully cleaned database');
      })
      .catch(err => {
        console.error(err)
      });
    });

    this.beforeEach(function(){
      console.log('=====================================================================')
    })

    this.afterEach(function(){
      console.log('=====================================================================')
    })

    it('Get all users endpoint returns all users', async () => {
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
        email: 'ianmcewan@gmail.com'
      }

      await request(server)
        .post('/users')
        .set('Accept', 'application/json')
        .send(NEW_USER)
        .expect('Content-Type', /json/)
        .expect(201);
      
      NEW_EXPECTED_USERS = [ EXPECTED_USERS[0], EXPECTED_USERS[1], NEW_USER ]

      await request(server)
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
          expect(response.body).to.have.deep.members(NEW_EXPECTED_USERS)
        });
    });

});

describe('User by id test case', function() {
  it('Get endpoint retrieves user with specified id', async () => {
    await request(server)
      .get('/users/123e4567-e89b-12d3-a456-426614174000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.deep.equal(EXPECTED_USERS[0])
      });
  });
});

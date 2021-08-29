const chai = require('chai')
const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');

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

describe('Get all users test', function() {
    it('Gets all users', async () => {
      await request(server)
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          console.log(`TEST LOG: Response was ${response.body}`)
          expect(response.body).to.have.deep.members(EXPECTED_USERS)
        });
    });
});


const request = require('supertest');
const server = require('../app');
const { expect } = require('chai');
var db = require('../models/index.js');
var passwordHasher = require('../utils/passwordHasher.js');

TEST_SEPARATOR = '=====================================================================';

VALIDATION_USERS = [
    {
      uuid: '123e4567-e89b-12d3-a456-426614175000',
      _ref: '1a919ac7-ca87-427d-9b82-3a8c5786082a',
      username: 'NeilGaiman',
      email: 'neilgaiman@gmail.com',
      password:  passwordHasher('goodOmens2022'),
      name: 'Neil Gaiman',
      phoneNumber: '222-000-777',
      profilePicture: null,
      alertsActivated: true,
      alertRadius: 1,
    }
  ]

describe('Users credential validation test case', function() {

  this.beforeEach('Before users credential validation test', async function() {
    // Re-initialize database
    return await db.Users.bulkCreate(VALIDATION_USERS)
          .then((res) => {
            // console.log(`TEST LOG: Successfully created user records ${res}`);
            console.log(TEST_SEPARATOR)
          })
          .catch(err => {
            console.error(`BEFORE TEST LOG: Error creating user records ${err}`);
          });

  });

  this.afterEach('After users credential validation test', async function() {
    // Clean database
    return await db.Users.destroy({
          where: {},
          force: true,
        })
        .then(() => {
          // console.log(`TEST LOG: Successfully deleted all records from Users table.`);
          console.log(TEST_SEPARATOR)
        })
        .catch(err => {
          console.error(`AFTER TEST LOG: Error deleting all records from Users table ${err}`);
          console.log(TEST_SEPARATOR)
        });
  });

  it('Post at credentialsValidation returns OK if password matches user', async () => {

    USER_INFO = Object.assign({}, VALIDATION_USERS[0])
    delete USER_INFO['password']

    await request(server)
      .post('/users/credentialValidation')
      .set('Accept', 'application/json')
      .send({'username':'NeilGaiman', 'password':'goodOmens2022'})
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.deep.equal(USER_INFO)
      });
  });

  it('Post at credentialsValidation returns UNAUTHORIZED if password does not match user', async () => {

    await request(server)
      .post('/users/credentialValidation')
      .set('Accept', 'application/json')
      .send({'username':'NeilGaiman', 'password':'goodOmens123'})
      .expect('Content-Type', /json/)
      .expect(401)
      .then(response => {
        console.log(`TEST LOG: Response was ${JSON.stringify(response.body)}`)
        expect(response.body).to.deep.equal({
            error: 'No user NeilGaiman with provided credentials'
        })
      });
  });

});

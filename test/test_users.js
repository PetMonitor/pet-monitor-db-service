const request = require('supertest');
const server = require('../app');
const { expect, assert } = require('chai').use(require('chai-bytes'));
var db = require('../models/index.js');
var passwordHasher = require('../utils/passwordHasher.js');
var fs = require('fs');

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");

// This sets the mock adapter on the default instance
var mock = new MockAdapter(axios);


TEST_SEPARATOR = '=====================================================================';

EMBEDDING = [ 
  0.06037527,-0.01576912,0.07322315,-0.09460726,-0.08096360,-0.02301554,0.14367725,-0.08457291,
  -0.01227567,-0.11083049,-0.06902093,-0.07299378,-0.14857993,-0.08143593,0.00886787,-0.12142590,
  -0.05042028,-0.10201982,-0.02582854,-0.05871225,0.06041538,-0.03485662,-0.04477020,-0.10418238,
  0.09800038,-0.05665335,-0.07040229,0.08284891,-0.10092543,0.02017560,-0.09319781,0.11097431,
  -0.12110960,0.08574340,0.03695728,-0.11780335,-0.09819926,0.06415571,0.10743850,0.14196600,-0.12936668,
  0.06096330,0.11253788,-0.13587150,-0.05594309,0.08005318,0.07479791,-0.03268669,-0.11030994,0.10099071,
  -0.10825977,0.10710515,0.14553122,-0.10120714,0.06041265,0.06630402,0.11567818,-0.02630793,-0.04872397,
  0.05499220,0.07236826,-0.04801438,-0.07588169,-0.11336783,0.07896858,-0.06593332,0.08287447,0.04932186,
  -0.08283250,-0.07132198,0.15232562,-0.14693299,-0.00676774,-0.07884897,0.08104447,0.10064926,0.12246129,
  0.07462891,-0.03215748,-0.07782545,0.10203280,0.08091006,0.05004479,-0.07561940,-0.05811106,-0.02652100,
  0.05840707,-0.10823300,0.06568510,0.04405428,-0.10763825,0.05636177,0.10309774,-0.03507317,0.05172334,
  0.08225141,-0.11055159,0.12676683,-0.08507260,0.05169133,0.09420424,-0.10848676,-0.05079362,-0.12370258,
  -0.11680937,-0.08039150,-0.06842650,0.12966783,0.10653536,-0.03532178,-0.08595541,0.14921825,-0.00625481,
  0.07807481,-0.01324250,-0.03535264,-0.14491458,0.09799559,0.15477061,0.08272006,0.05744857,-0.04393201,
  -0.10136475,0.08224790,0.11506042,0.11539490,0.07415865,-0.10429314 
]

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

const IMAGE_CONTENT = fs.readFileSync('./seeders/resources/dogImage.json');
const IMAGE_CONTENT_BLOB = Buffer.from(JSON.parse(IMAGE_CONTENT).image, 'base64');

PHOTOS = [
  {
    uuid: '126e4567-e89b-12d3-a456-426614176001',
    photo: IMAGE_CONTENT_BLOB,
  },
  {
    uuid: '126e4567-e89b-12d3-a456-426614176002',
    photo: IMAGE_CONTENT_BLOB
  },
  {
    uuid: '126e4567-e89b-12d3-a456-426614176003',
    photo: IMAGE_CONTENT_BLOB
  }
]

mock.onPost("http://host.docker.internal:5001/api/v0/dogs/embedding").reply(200, {
  embeddings: [{ 
    '126e4567-e89b-12d3-a456-426614176001': EMBEDDING,
    '126e4567-e89b-12d3-a456-426614176002': EMBEDDING,
    '126e4567-e89b-12d3-a456-426614176003': EMBEDDING
  }],
});

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
    expect(Buffer.from(photo0['dataValues']['photo'])).to.equalBytes(IMAGE_CONTENT_BLOB);
    expect(Buffer.from(photo1['dataValues']['photo'])).to.equalBytes(IMAGE_CONTENT_BLOB);
    expect(Buffer.from(photo2['dataValues']['photo'])).to.equalBytes(IMAGE_CONTENT_BLOB);
    
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

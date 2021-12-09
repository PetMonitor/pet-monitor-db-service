var express = require('express');
var router = express.Router();
var passwordHasher = require('../utils/passwordHasher.js');
var uuid = require('uuid');

var http = require('http-status-codes');
const db = require('../models/index.js');

/**
 * User CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		db.Users.findAll({ attributes: ['uuid', '_ref', 'username', 'email'] })
			.then((users) => { 
				console.log(`Returning users ${JSON.stringify(users)}`);
				res.status(http.StatusCodes.OK).json(users); 
			}).catch(err => {
				console.error(err);
				res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
				  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
				});
			});
  	} catch (err) {
  		console.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
		});
  	} 
});

router.get('/:userId', async (req, res) => {
	try {
		db.Users.findByPk(req.params.userId, { attributes: ['uuid', '_ref', 'username', 'email'] })
			.then((user) => { 
				res.status(http.StatusCodes.OK).json(user); 
			}).catch(err => {
				console.error(err);
				res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
				  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
				});
			});
  	} catch (err) {
  		console.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
});

router.post('/', async (req, res) => {
    try {
		return db.sequelize.transaction(function (t) {
			//console.log(`Creating user ${JSON.stringify(req.body)}`);
			db.Users.create({
				uuid: req.body.uuid,
				_ref: req.body._ref,
				username: req.body.username,
				password: passwordHasher(req.body.password),
				email: req.body.email,
				createdAt: new Date(),
				updatedAt: new Date()
			}).then((user) => {
				delete user['password'];

				if (req.body.pets.length === 0) {
					return;
				}

				// Create user pets
				req.body.pets.forEach(pet => {
					db.Pets.create({
						uuid: pet.uuid,
						_ref: pet._ref,
						userId: user.uuid,
						type: pet.type,
						name: pet.name,
						furColor: pet.furColor,
						breed: pet.breed,
						size: pet.size,
						lifeStage: pet.lifeStage,
						sex: pet.sex,
						description: pet.description,
						createdAt: new Date(),
						updatedAt: new Date()
					});
					
					if (typeof pet.photos === 'undefined' || pet.photos.length === 0) {
						// return means continue in this context.
						return;
					}

					console.log('Created pet successfully! Creating photos...');


					// Add pet photos
					pet.photos.forEach(petPhoto => {
						db.Photos.create({
							uuid: uuid.v4(),
							photo: Buffer.from(petPhoto,'base64'),
							createdAt: new Date(),
							updatedAt: new Date()
						}).then(createdPhoto => {
							db.PetPhotos.create({
								petId: pet.uuid,
								photoId: createdPhoto.uuid,
								createdAt: new Date(),
								updatedAt: new Date()
							})
						});
					});
				});
			});
		}).then(function (result) {
			// Transaction has been committed
			// result is whatever the result of the promise chain returned to the transaction callback
			createdUser = { uuid: req.body.uuid, _ref: req.body._ref, username: req.body.username}
			console.log('User creation transaction completed successfully!');
			return res.status(http.StatusCodes.CREATED).json(createdUser); 
		}).catch(function (err) {
			// Transaction has been rolled back
			// err is whatever rejected the promise chain returned to the transaction callback
			console.error('User creation transaction has been rolled back!');
			throw err;
		});
	} catch (err) {
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	}
});


router.delete('/:userId', async (req, res) => {
    try {
        db.Users.destroy({ 
			where: { 
				uuid: req.params.userId 
			}
		}).then((deletedCount) => {
		    res.status(http.StatusCodes.OK).json({'deletedCount': deletedCount }); 
		}).catch(err => {
			console.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	} 
});

router.put('/:userId', async (req, res) => {
	try {
		//TODO: check for _ref
        var updateUserFields = req.body
        updateUserFields['updatedAt'] = new Date();
        db.Users.update(updateUserFields, { 
			where: { 
				uuid: req.params.userId 
			}
		}).then((affectedRows) => {
		    res.status(http.StatusCodes.OK).json({ 'updatedCount': affectedRows[0] }); 
		}).catch(err => {
			console.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });		
	}
});

module.exports = router;
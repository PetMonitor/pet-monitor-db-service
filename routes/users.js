var express = require('express');

var router = express.Router();

const db = require('../models/index.js');
var http = require('http-status-codes');
const logger = require('../utils/logger.js');
const commons = require('../utils/common.js');
const emails = require('../utils/emails.js');
var generator = require('generate-password');
var passwordHasher = require('../utils/passwordHasher.js');


const REGENERATED_PWD_LENGTH = 10;

/**
 * User CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		db.Users.findAll({ attributes: ['uuid', '_ref', 'name', 'username', 'email', 'phoneNumber', 'alertRadius', 'alertRegion', 'alertCoordinates', 'alertsActivated', 'profilePicture'] })
			.then((users) => { 
				logger.info(`Returning users ${JSON.stringify(users)}`);
				users.map(user => {
					let response = user.dataValues
					if (user.alertCoordinates != null) {
						response["alertLocationLat"] = user.alertCoordinates.coordinates[1];
						response["alertLocationLong"] = user.alertCoordinates.coordinates[0];
					}
					delete response["alertCoordinates"]
					return response
				})
				res.status(http.StatusCodes.OK).json(users); 
			}).catch(err => {
				logger.error(err);
				res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
				  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
				});
			});
  	} catch (err) {
  		logger.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
		});
  	} 
});

router.get('/:userId', async (req, res) => {
	try {
		db.Users.findByPk(req.params.userId, { attributes: ['uuid', '_ref', 'username', 'email', 'name', 'phoneNumber', 'alertsActivated', 'alertRadius', 'alertRegion', 'alertCoordinates', 'profilePicture' ] })
			.then((user) => {
				let response = user.dataValues
				if (user.alertCoordinates != null) {
					response["alertLocationLat"] = user.alertCoordinates.coordinates[1];
					response["alertLocationLong"] = user.alertCoordinates.coordinates[0];
				}
				delete response["alertCoordinates"]
				res.status(http.StatusCodes.OK).json(response);
			}).catch(err => {
				logger.error(err);
				res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
				  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
				});
			});
  	} catch (err) {
  		logger.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
});

router.get('/facebook/:facebookId', async (req, res) => {
	try {
		db.Users.findAll( 
			{ 
				where: { facebookId: req.params.facebookId },
				attributes: ['uuid', '_ref', 'username', 'email', 'name', 'phoneNumber', 'alertsActivated', 'alertRadius', 'alertRegion', 'alertCoordinates', 'profilePicture' ]
			})
			.then((user) => {
				let response = user.dataValues
				if (user.alertCoordinates != null) {
					response["alertLocationLat"] = user.alertCoordinates.coordinates[1];
					response["alertLocationLong"] = user.alertCoordinates.coordinates[0];
				}
				delete response["alertCoordinates"]
				res.status(http.StatusCodes.OK).json(response);
			}).catch(err => {
				logger.error(err);
				res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
				  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
				});
			});
  	} catch (err) {
  		logger.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
});

router.post('/', async (req, res) => {
	// TODO: improve password hashing method
	//logger.info(`Attempting to create new user... ${JSON.stringify(req.body)}`);

	const tx = await db.sequelize.transaction();
	try {

		if (req.body.profilePicture) {
			await db.Photos.create({
				uuid: req.body.profilePicture.uuid,
				photo: Buffer.from(req.body.profilePicture.photo, 'base64'),
				createdAt: new Date(),
				updatedAt: new Date()
			}, { transaction: tx });
		}

		const user = await db.Users.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			username: req.body.username,
			password: req.body.password? passwordHasher(req.body.password): '',
			facebookId: req.body.facebookId? req.body.facebookId : '',
			phoneNumber: req.body.phoneNumber?  req.body.phoneNumber : '',
			name: req.body.name? req.body.name: '',
			profilePicture: req.body.profilePicture? req.body.profilePicture.uuid : null,
			alertsActivated: req.body.alertsActivated? req.body.alertsActivated : false,
			alertRadius: req.body.alertRadius? req.body.alertRadius : -1,
			alertCoordinates: (req.body.alertLocationLong != null && req.body.alertLocationLat != null) ? db.sequelize.fn('ST_GeographyFromText', `SRID=4326;POINT (${req.body.alertLocationLong} ${req.body.alertLocationLat})`) : null,
			alertRegion: req.body.alertRegion,
			email: req.body.email,
			createdAt: new Date(),
			updatedAt: new Date()
		}, { transaction: tx });


		if (req.body.pets === undefined || req.body.pets.length === 0) {
			await tx.commit();
			logger.info('No pets registered for user!');

			logger.info('Successfully created new user!');
			return res.status(http.StatusCodes.CREATED).json(user); 
		}

		const petList = req.body.pets.map(pet => { return {
			uuid: pet.uuid,
			_ref: pet._ref,
			userId: user.uuid,
			type: pet.type,
			name: pet.name? pet.name : '',
			furColor: pet.furColor,
			breed: pet.breed? pet.breed : '',
			size: pet.size,
			lifeStage: pet.lifeStage,
			sex: pet.sex,
			age: pet.age? pet.age : null,
			description: pet.description,
			createdAt: new Date(),
			updatedAt: new Date()
		}});

		logger.info(`Attempting to create ${JSON.stringify(petList)} new pets for user...`);

		const pets = await db.Pets.bulkCreate(petList, {transaction: tx});

		let photosList = []
		let petPhotosList = [];
		
		logger.info(`Created pets ${JSON.stringify(petList)}`);


		for (var i = 0; i < req.body.pets.length; i++) {

			logger.info(`Attempting to create photo embeddings for pet ${req.body.pets[i].name}`);

			let resEmbeddings = await commons.getEmbeddingsForDogPhotos(req.body.pets[i].photos);
			
			for (var j = 0; j < req.body.pets[i].photos.length; j++) {
				const photo = req.body.pets[i].photos[j];
				const photoBuffer = Buffer.from(photo.photo,'base64');		
				
				const petPhoto = {
					uuid: photo.uuid,
					photo: photoBuffer,
					createdAt: new Date(),
					updatedAt: new Date()
				}

				petPhotosList.push({
					petId: req.body.pets[i].uuid,
					photoId: petPhoto.uuid,
					embedding: resEmbeddings.data.embeddings[photo.uuid],
					createdAt: new Date(),
					updatedAt: new Date()
				});

				photosList.push(petPhoto);
			}

		}

		// Add pet photos
		await db.Photos.bulkCreate(photosList, { transaction: tx });

		logger.info(`Inserting pet photos ${petPhotosList.length}`);

		// Link photos to pets
		await db.PetPhotos.bulkCreate(petPhotosList, { transaction: tx });

		await tx.commit();
		let response = user.dataValues
		if (user.alertCoordinates != null) {
			response["alertLocationLat"] = user.alertCoordinates.coordinates[1];
			response["alertLocationLong"] = user.alertCoordinates.coordinates[0];
		}
		delete response["alertCoordinates"]
		logger.info('Successfully created user and pets!');
		return res.status(http.StatusCodes.CREATED).json(response);

	} catch (error) {
		await tx.rollback();
		logger.error(`User creation failed, rolling transaction back. ${error}`, error);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + error 
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
			logger.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		logger.error(err);
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
			logger.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		logger.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });		
	}
});

router.put('/:userId/password', async (req, res) => {
	try {
		//TODO: check for _ref
        var updateUserFields = req.body

		result = await updateUserPassword(
			updateUserFields._ref,
			req.params.userId,
			passwordHasher(updateUserFields.oldPassword),
			updateUserFields.newPassword,
		)

		res.status(http.StatusCodes.OK).json({ 'updatedCount': result[0] });
	} catch (err) {
		logger.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });		
	}
});

router.put('/password/reset', async (req, res) => {
	try {
		logger.info(`Resetting password for user with email ${JSON.stringify(req.body)}`)

		var userEmail = req.body.emailAddress;

		const userWithEmail = await db.Users.findOne({ where: { email: userEmail } });

		logger.info(`Found users with email ${JSON.stringify(userWithEmail)}`)

		if (!userWithEmail) {
			const errorMsg = `Attempted to reset password for user with email ${JSON.stringify(userEmail)}, but no users found with that email address.`
			logger.error(errorMsg)
			return res.status(http.StatusCodes.NOT_FOUND).send({ error: errorMsg });
		}

		var randomSecurePwd = generator.generate({
			length: REGENERATED_PWD_LENGTH,
			numbers: true
		});

		result = await updateUserPassword(
			userWithEmail._ref,
			userWithEmail.uuid,
			userWithEmail.password,
			randomSecurePwd,
		)

		await emails.sendEmail(
			userEmail, 
			'Cambio de Contraseña!',
			'../static/emailPasswordResetTemplate.html',
			{ tempPassword: randomSecurePwd }
		)

		return res.status(http.StatusCodes.OK).send({ 'updatedCount': result[0] });
	} catch (err) {
		logger.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });		
	}
});

updateUserPassword = async (_ref, userId, oldPassword, newPassword) => {

	const newPasswordObj = { 
		_ref: _ref,
		password: passwordHasher(newPassword),
		updatedAt: new Date()
	}

	result = await db.Users.update(newPasswordObj, { 
		where: { 
			uuid: userId,
			password: oldPassword
		}
	})

	return result;
}

module.exports = router;
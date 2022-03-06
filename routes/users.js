var express = require('express');
var router = express.Router();
var passwordHasher = require('../utils/passwordHasher.js');
var uuid = require('uuid');

var http = require('http-status-codes');
const db = require('../models/index.js');
var sharp = require('sharp');

LOW_RES_PHOTO_DIMENSION = 130

/**
 * User CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		db.Users.findAll({ attributes: ['uuid', '_ref', 'name', 'username', 'email', 'phone_number', 'alert_radius', 'alerts_activated', 'profile_picture'] })
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
		db.Users.findByPk(req.params.userId, { attributes: ['uuid', '_ref', 'username', 'email', 'name', 'phone_number', 'alerts_activated', 'alert_radius', 'profile_picture' ] })
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
	// TODO: improve password hashing method
	console.log('Attempting to create new user...');

	const tx = await db.sequelize.transaction();
	try {
		const user = await db.Users.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			username: req.body.username,
			password: passwordHasher(req.body.password),
			phone_number: '',
			name: '',
			profile_picture: null,
			alerts_activated: false,
			alert_radius: -1,
			email: req.body.email,
			createdAt: new Date(),
			updatedAt: new Date()
		}, { transaction: tx });


		if (req.body.pets === undefined || req.body.pets.length === 0) {
			await tx.commit();
			console.log('No pets registered for user!');

			console.log('Successfully created new user!');
			return res.status(http.StatusCodes.CREATED).json(user); 
		}

		const petList = req.body.pets.map(pet => { return {
			uuid: pet.uuid,
			_ref: pet._ref,
			user_id: user.uuid,
			type: pet.type,
			name: pet.name,
			fur_color: pet.furColor,
			breed: pet.breed,
			size: pet.size,
			life_stage: pet.lifeStage,
			sex: pet.sex,
			description: pet.description,
			createdAt: new Date(),
			updatedAt: new Date()
		}});

		console.log('Attempting to create new pets for user...');

		const pets = await db.Pets.bulkCreate(petList, {transaction: tx});

		let petPhotosList = [];
		let photosList = []

		for (var i = 0; i < req.body.pets.length; i++) {

			for (var j = 0; j < req.body.pets[i].photos.length; j++) {

				const photoBuffer = Buffer.from(req.body.pets[i].photos[j].photo,'base64');
				let lowResPhoto = sharp(photoBuffer).resize(LOW_RES_PHOTO_DIMENSION, LOW_RES_PHOTO_DIMENSION);
				lowResPhotoBuffer = await lowResPhoto.toBuffer();

				const petPhoto = {
					uuid: req.body.pets[i].photos[j].uuid,
					photo: photoBuffer,
					low_res_photo: lowResPhotoBuffer,
					createdAt: new Date(),
					updatedAt: new Date()
				}

				petPhotosList.push({
					pet_id: req.body.pets[i].uuid,
					photo_id: petPhoto.uuid,
					createdAt: new Date(),
					updatedAt: new Date()
				});

				photosList.push(petPhoto);
			}

		}


		await Promise.all(photosList);

		// Add pet photos
		//await db.Photos.bulkCreate(photosList, { transaction: tx });
		for (const photo of photosList) {
			console.log(`Inserting photo ${photo.uuid} ${photo.lowResPhoto}`);
			await db.Photos.create(photo, { transaction: tx });
		}

		console.log(`Inserting pet photos ${petPhotosList.length}`);

		// Link photos to pets
		//await db.Photos.bulkCreate(petPhotosList, { transaction: tx });
		for (const petPhoto of petPhotosList) {
			await db.PetPhotos.create(petPhoto, { transaction: tx });
		}

		await tx.commit();
		console.log('Successfully created user and pets!');
		return res.status(http.StatusCodes.CREATED).json(user); 

	} catch (error) {
		await tx.rollback();
		console.error(`User creation failed, rolling transaction back. ${error}`);
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

router.put('/:userId/password', async (req, res) => {
	try {
		//TODO: check for _ref

        var updateUserFields = req.body

		const newPassword = { 
			_ref: updateUserFields._ref,
			password: passwordHasher(updateUserFields.newPassword),
			updatedAt: new Date()
		}

        db.Users.update(newPassword, { 
			where: { 
				uuid: req.params.userId,
				password: passwordHasher(updateUserFields.oldPassword) 
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
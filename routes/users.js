var express = require('express');

var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');
var sharp = require('sharp');

var passwordHasher = require('../utils/passwordHasher.js');


const axios = require('axios').default; 

LOW_RES_PHOTO_DIMENSION = 130
const FACE_REC_PORT = process.env.FACE_REC_PORT || '5001';

/**
 * User CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		db.Users.findAll({ attributes: ['uuid', '_ref', 'name', 'username', 'email', 'phoneNumber', 'alertRadius', 'alertsActivated', 'profilePicture'] })
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
		db.Users.findByPk(req.params.userId, { attributes: ['uuid', '_ref', 'username', 'email', 'name', 'phoneNumber', 'alertsActivated', 'alertRadius', 'profilePicture' ] })
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
			phoneNumber: req.body.phoneNumber?  req.body.phoneNumber : '',
			name: req.body.name? req.body.name: '',
			profilePicture: null,
			alertsActivated: req.body.alertsActivated? req.body.alertsActivated : false,
			alertRadius: req.body.alertRadius? req.body.alertRadius : -1,
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

		console.log('Attempting to create new pets for user...');

		const pets = await db.Pets.bulkCreate(petList, {transaction: tx});

		let petPhotosList = [];
		let photosList = []

		for (var i = 0; i < req.body.pets.length; i++) {

			// let resEmbeddings = await getEmbeddingsForDogPhotos(req.body.pets[i].photos);
			
			for (var j = 0; j < req.body.pets[i].photos.length; j++) {
				const photo = req.body.pets[i].photos[j];
				const photoBuffer = Buffer.from(photo.photo,'base64');
				let lowResPhoto = sharp(photoBuffer).resize(LOW_RES_PHOTO_DIMENSION, LOW_RES_PHOTO_DIMENSION);
				lowResPhotoBuffer = await lowResPhoto.toBuffer();				
				
				const petPhoto = {
					uuid: photo.uuid,
					photo: photoBuffer,
					lowResPhoto: lowResPhotoBuffer,
					createdAt: new Date(),
					updatedAt: new Date()
				}

				petPhotosList.push({
					petId: req.body.pets[i].uuid,
					photoId: petPhoto.uuid,
					// embedding: resEmbeddings.data.embeddings[photo.uuid],
					embedding: [
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
					],
					createdAt: new Date(),
					updatedAt: new Date()
				});

				photosList.push(petPhoto);
			}

		}

		// Add pet photos
		await db.Photos.bulkCreate(photosList, { transaction: tx });

		console.log(`Inserting pet photos ${petPhotosList.length}`);

		// Link photos to pets
		await db.PetPhotos.bulkCreate(petPhotosList, { transaction: tx });

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

async function getEmbeddingsForDogPhotos(photos) {
	return axios.post(`http://host.docker.internal:${FACE_REC_PORT}/api/v0/dogs/embedding`, {
		dogs: photos
	});
};


module.exports = router;
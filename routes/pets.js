var express = require('express');
var sharp = require('sharp');
var http = require('http-status-codes');
const db = require('../models/index.js');
const commons = require('../utils/common.js');

var router = express.Router({ mergeParams: true });

/**
* Pet CRUD endpoints.
*/

router.get('/', async (req, res) => {
	try {
        db.Pets.findAll({ 
			where: { 
				userId: req.params.userId 
			},
			include: [{
				model: db.PetPhotos,
				//left join
				required: false, 
				include: [{
					model: db.Photos,
					//left join
					required: false
				}]
			}]
		}).then((pets) => { 

            const resObj = pets.map(pet => 
				Object.assign({},{ 
					uuid: pet.uuid,
					_ref: pet._ref,
					userId: pet.userId,
					type: pet.type,
					name: pet.name,
					furColor: pet.furColor,
					rightEyeColor: pet.rightEyeColor,
					leftEyeColor: pet.leftEyeColor,
					breed: pet.breed,
					size: pet.size,
					lifeStage: pet.lifeStage,
					age: pet.age,
					sex: pet.sex,
					description: pet.description,
					photos: pet.PetPhotos.map(petPhoto =>
						Object.assign({},{ 
							photoId: petPhoto.photoId
						})
					)
				})
			); 

            res.status(http.StatusCodes.OK).json(resObj); 
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

router.get('/:petId', async (req, res) => {
	try {
		db.Pets.findOne({ 
			where: { 
			    uuid: req.params.petId, 
			    userId: req.params.userId 
            },
			include: [{
				model: db.PetPhotos,
				required: false,
				include: [{
					model: db.Photos,
					required: false
				}]
			}]
		}).then((pet) => { 
            const resObj = Object.assign({},{ 
				uuid: pet.uuid,
				_ref: pet._ref,
				userId: pet.userId,
				type: pet.type,
				name: pet.name,
				furColor: pet.furColor,
				rightEyeColor: pet.rightEyeColor,
				leftEyeColor: pet.leftEyeColor,
				breed: pet.breed,
				size: pet.size,
				lifeStage: pet.lifeStage,
				age: pet.age,
				sex: pet.sex,
				description: pet.description,
                photos: pet.PetPhotos.map(petPhoto =>
					Object.assign({},{ 
						photoId: petPhoto.photoId
					})
				)
			})
		    
			res.status(http.StatusCodes.OK).json(resObj); 

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
	const tx = await db.sequelize.transaction();

    try {
		console.log(`Creating pet ${JSON.stringify(req.body)}`);

		let resEmbeddings = []
		if (req.body.photos.length > 0) {
			resEmbeddings = await commons.getEmbeddingsForDogPhotos(req.body.photos);
		}

		const pet = await db.Pets.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			userId: req.params.userId,
			type: req.body.type,
			name: req.body.name,
			furColor: req.body.furColor,
            breed: req.body.breed,
			size: req.body.size,
			lifeStage: req.body.lifeStage,
            sex: req.body.sex,
			description: req.body.description,
			createdAt: new Date(),
			updatedAt: new Date()
		}, { transaction: tx });

		let photosList = []
		let petPhotosList = []

		for (var i = 0; i < req.body.photos.length; i++) {

			const photoBuffer = Buffer.from(req.body.photos[i].photo,'base64');

			photosList.push({
				uuid: req.body.photos[i].uuid,
				photo: photoBuffer,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			petPhotosList.push({
				petId: pet.uuid,
				photoId: req.body.photos[i].uuid,
				embedding: resEmbeddings.data.embeddings[req.body.photos[i].uuid],
				createdAt: new Date(),
				updatedAt: new Date()
			})
		};


		// Add pet photos
		await db.Photos.bulkCreate(photosList, { transaction: tx });

		console.log(`Inserting pet photos ${petPhotosList.length}`);

		// Link photos to pets
		await db.PetPhotos.bulkCreate(petPhotosList, { transaction: tx });

		await tx.commit();
		console.log(`Successfully created pet ${pet.uuid} - ${pet.name} !`);

		return res.status(http.StatusCodes.CREATED).json(pet); 
	} catch (err) {
		await tx.rollback();
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	}
});

router.put('/:petId', async (req, res) => {
	try {
		//TODO: check for _ref
        var updatedPetFields = req.body
        updatedPetFields['updatedAt'] = new Date();
        db.Pets.update(updatedPetFields, { 
			where: { 
				uuid: req.params.petId,
				userId: req.params.userId 
			}
		}).then((result) => {
		    res.status(http.StatusCodes.OK).json(result); 
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

router.delete('/:petId', async (req, res) => {
	try {
        db.Pets.destroy({ 
			where: { 
				uuid: req.params.petId,
                userId: req.params.userId
			}
		}).then((deletedCount) => {
		    res.status(http.StatusCodes.OK).json(deletedCount); 
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
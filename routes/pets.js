var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');

var router = express.Router({mergeParams: true});

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
							photoId: petPhoto.photoId,
							// photoContent: Buffer.from(petPhoto.Photo.photo).toString('base64')
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
						photoId: petPhoto.photoId,
                        //photoContent: petPhoto.Photo.photo.toString('base64')
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
    try {
		console.log(`Creating pet ${req.body.uuid}`);
		db.Pets.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			userId: req.params.userId,
			type: req.body.type,
			name: req.body.name,
			furColor: req.body.furColor,
			rightEyeColor: req.body.rightEyeColor,
			leftEyeColor: req.body.leftEyeColor,
            breed: req.body.breed,
			size: req.body.size,
			lifeStage: req.body.lifeStage,
			age: req.body.age,
            sex: req.body.sex,
			description: req.body.description,
			createdAt: new Date(),
			updatedAt: new Date()
		}).then((pet) => {
		    res.status(http.StatusCodes.CREATED).json(pet); 
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
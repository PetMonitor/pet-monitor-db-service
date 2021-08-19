var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
<<<<<<< HEAD
const db = require('../models/index.js');
=======
const db = require('/usr/src/app/models/index.js');
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)

var router = express.Router({mergeParams: true});

/**
<<<<<<< HEAD
* Pet CRUD endpoints.
*/

router.get('/', async (req, res) => {
=======
 * Pet CRUD endpoints.
 */

 router.get('/', async (req, res) => {
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
	try {
        db.Pets.findAll({ 
			where: { 
				userId: req.params.userId 
<<<<<<< HEAD
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
							photoContent: petPhoto.Photo.photo.toString('base64')
						})
					)
				})
			); 

            res.status(http.StatusCodes.OK).json(resObj); 
=======
			}
		}).then((pets) => { 
            res.status(http.StatusCodes.OK).send(JSON.stringify(pets)); 
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
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
                        photoContent: petPhoto.Photo.photo.toString('base64')
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
<<<<<<< HEAD
		    res.status(http.StatusCodes.CREATED).json(pet); 
=======
		    res.status(http.StatusCodes.CREATED).send(JSON.stringify(pet)); 
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
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
<<<<<<< HEAD
		//TODO: check for _ref
=======
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
        var updatedPetFields = req.body
        updatedPetFields['updatedAt'] = new Date();
        db.Pets.update(updatedPetFields, { 
			where: { 
				uuid: req.params.petId,
				userId: req.params.userId 
			}
		}).then((result) => {
<<<<<<< HEAD
		    res.status(http.StatusCodes.OK).json(result); 
=======
		    res.status(http.StatusCodes.OK).send(JSON.stringify(result)); 
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
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
<<<<<<< HEAD
		    res.status(http.StatusCodes.OK).json(deletedCount); 
=======
		    res.status(http.StatusCodes.OK).send(JSON.stringify(deletedCount)); 
>>>>>>> 7d7ab0d (Finish first integration for endpoints users, pets and notices)
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
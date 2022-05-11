var express = require('express');
var sharp = require('sharp');
var http = require('http-status-codes');
const db = require('../models/index.js');
const axios = require('axios').default; 

var router = express.Router({mergeParams: true});

const FACE_REC_PORT = process.env.FACE_REC_PORT || '5001';

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
		// console.log(`Creating pet ${JSON.stringify(req.body)}`);

		let resEmbeddings = []
		// if (req.body.photos.length > 0) {
		// 	resEmbeddings = await getEmbeddingsForDogPhotos(req.body.photos);
		// }

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
			let lowResPhoto = sharp(photoBuffer).resize(LOW_RES_PHOTO_DIMENSION, LOW_RES_PHOTO_DIMENSION);
			lowResPhotoBuffer = await lowResPhoto.toBuffer();				

			photosList.push({
				uuid: req.body.photos[i].uuid,
				photo: photoBuffer,
				lowResPhoto: lowResPhotoBuffer,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			petPhotosList.push({
				petId: pet.uuid,
				photoId: req.body.photos[i].uuid,
				embedding: [
					0.13874154,-0.06146756,0.03866471,0.09056792,0.01131686,-0.03153004,0.12399054,-0.02646407,0.07816512,
					-0.12955536,-0.03814786,0.00729998,-0.03980283,-0.01935625,-0.04253754,-0.12979524,0.18433110,
					-0.01140885,-0.00181289,0.06395799,-0.03009514,0.01477101,0.02102796,-0.07259221,0.03818289,-0.03624843,
					-0.02503233,0.04009697,-0.05871342,-0.08031725,-0.00211188,0.03283843,-0.09090032,-0.12535787,0.01699665,
					-0.06209861,-0.04413989,0.13794856,0.13825807,0.15223894,-0.11756990,0.01223269,0.05772111,-0.12226101,
					0.07304493,0.02878779,0.03286171,0.05787703,-0.03625213,0.13634162,-0.09500243,0.11837282,0.08262048,
					-0.16089818,0.03458154,0.04495639,0.08605432,0.05115551,0.10091221,0.06353297,0.06211134,-0.08680654,
					0.07157503,-0.03841954,0.09336978,-0.02442301,0.16721801,0.10379912,-0.06417280,0.00966562,-0.02065616,
					-0.06837126,0.02206358,-0.01306145,-0.00118577,-0.04062780,-0.02789476,-0.16548227,-0.17267114,-0.07798032,
					0.05631012,0.01712796,0.14559455,-0.00290712,-0.05656023,-0.03834035,0.00735089,-0.20848316,0.00389902,
					0.00656449,-0.12010869,0.04386731,-0.08388881,-0.10976069,-0.10768904,0.01034067,-0.06060373,0.11023328,
					-0.08048328,-0.00468308,0.04066935,-0.00887638,-0.00112705,-0.12654811,-0.09492322,-0.01695582,-0.03434376,
					0.05708534,0.10450708,-0.23296049,-0.05483235,0.27802905,0.19018215,0.06378388,0.15511988,-0.05587771,
					-0.09323996,0.10207225,0.14965251,0.03970487,0.02230936,-0.05761594,-0.04349528,-0.02419937,-0.01597672,
					0.02541647,0.04321629,-0.16132420
				],
				// embedding: resEmbeddings.data.embeddings[req.body.photos[i].uuid],
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

async function getEmbeddingsForDogPhotos(photos) {
	return axios.post(`http://host.docker.internal:${FACE_REC_PORT}/api/v0/dogs/embedding`, {
		dogs: photos
	});
};

module.exports = router;
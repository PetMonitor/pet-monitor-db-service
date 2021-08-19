var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('/usr/src/app/models/index.js');

var router = express.Router({mergeParams: true});

/**
 * Pet CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	try {
        db.Pets.findAll({ 
			where: { 
				userId: req.params.userId 
			}
		}).then((pets) => { 
            res.status(http.StatusCodes.OK).send(JSON.stringify(pets)); 
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
            }
		}).then((user) => { 
			res.status(http.StatusCodes.OK).send(JSON.stringify(user)); 
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
		    res.status(http.StatusCodes.CREATED).send(JSON.stringify(pet)); 
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
        var updatedPetFields = req.body
        updatedPetFields['updatedAt'] = new Date();
        db.Pets.update(updatedPetFields, { 
			where: { 
				uuid: req.params.petId,
				userId: req.params.userId 
			}
		}).then((result) => {
		    res.status(http.StatusCodes.OK).send(JSON.stringify(result)); 
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
		    res.status(http.StatusCodes.OK).send(JSON.stringify(deletedCount)); 
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
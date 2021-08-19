var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('/usr/src/app/models/index.js');

/**
 * User CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		db.Users.findAll({ attributes: ['uuid', 'username', 'email'] })
			.then((users) => { 
				res.status(http.StatusCodes.OK).send(JSON.stringify(users)); 
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
		db.Users.findByPk(req.params.userId, { attributes: ['uuid', 'username', 'email'] })
			.then((user) => { 
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
		console.log(`Creating user ${req.body.uuid}`);
		db.Users.create({
			uuid: req.body.uuid,
			username: req.body.username,
			password: req.body.password,
			email: req.body.email,
			createdAt: new Date(),
			updatedAt: new Date()
		}).then((user) => {
		    res.status(http.StatusCodes.CREATED).send(JSON.stringify(user)); 
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


router.delete('/:userId', async (req, res) => {
    try {
        db.Users.destroy({ 
			where: { 
				uuid: req.params.userId 
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

router.put('/:userId', async (req, res) => {
	try {
        var updateUserFields = req.body
        updateUserFields['updatedAt'] = new Date();
        db.Users.update(updateUserFields, { 
			where: { 
				uuid: req.params.userId 
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

module.exports = router;
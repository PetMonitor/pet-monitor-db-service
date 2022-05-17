var express = require('express');

const Sequelize = require('sequelize');

var http = require('http-status-codes');
const db = require('../models/index.js');

var router = express.Router({mergeParams: true});

/**
* Photos CRUD endpoints.
*/

// Add new photo
router.get('/:photoId', async (req, res) => {
	try {
		console.log(`Attempting to fetch photos with id ${req.params.photoId}`);
		db.Photos.findByPk(req.params.photoId, { attributes: ['uuid', 'lowResPhoto'] })
			.then((photo) => {
				console.log(`Sending image ${photo.uuid}`);
				res.status(http.StatusCodes.OK)
				.setHeader('Content-Type', 'image/png')
				.send(Buffer.from(photo.lowResPhoto, 'base64'));
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
})

router.get('/profile/:userId', async (req, res) => {
	try {
		console.log(`Attempting to fetch profile picture for user ${req.params.userId}`);
		await db.sequelize.query(
			`SELECT "Photos".photo photo FROM "Users" INNER JOIN "Photos" ON "Photos".uuid =  "Users"."profilePicture" WHERE  "Users".uuid = '${req.params.userId}'`, 
			{ type: Sequelize.QueryTypes.SELECT }
		).then(records => {

			res.status(http.StatusCodes.OK)
				.setHeader('Content-Type', 'image/png')
				.send(Buffer.from(records[0].photo, 'base64'));
		});
		
  	} catch (err) {
  		console.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
})


module.exports = router;
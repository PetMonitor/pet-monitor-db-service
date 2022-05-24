var express = require('express');

const Sequelize = require('sequelize');

var http = require('http-status-codes');
const db = require('../models/index.js');
const logger = require('../utils/logger.js');

var router = express.Router({mergeParams: true});

/**
* Photos CRUD endpoints.
*/

router.get('/:photoId', async (req, res) => {
	try {
		logger.info(`Attempting to fetch photos with id ${req.params.photoId}`);
		db.Photos.findByPk(req.params.photoId, { attributes: ['uuid', 'photo'] })
			.then((photo) => {
				logger.info(`Sending image ${photo.uuid}`);
				res.status(http.StatusCodes.OK)
				.setHeader('Content-Type', 'image/png')
				.send(Buffer.from(photo.photo, 'base64'));
			}).catch(err => {
				logger.info(err);
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
})

router.get('/profile/:userId', async (req, res) => {
	try {
		logger.info(`Attempting to fetch profile picture for user ${req.params.userId}`);
		await db.sequelize.query(
			`SELECT "Photos".photo photo FROM "Users" INNER JOIN "Photos" ON "Photos".uuid =  "Users"."profilePicture" WHERE  "Users".uuid = '${req.params.userId}'`, 
			{ type: Sequelize.QueryTypes.SELECT }
		).then(records => {
			if (records.length > 0 && records[0] != undefined){
				return res.status(http.StatusCodes.OK)
					.setHeader('Content-Type', 'image/png')
					.send(Buffer.from(records[0].photo, 'base64'));
			}
			logger.info(`No profile picture found for user ${req.params.userId}`);

			return res.status(http.StatusCodes.NOT_FOUND).send({ 
				error: `No profile picture found for user ${req.params.userId}`
			});
		});
		
  	} catch (err) {
  		console.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
})


module.exports = router;
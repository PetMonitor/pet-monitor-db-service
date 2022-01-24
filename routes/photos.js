var express = require('express');
var router = express.Router();

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
		db.Photos.findByPk(req.params.photoId, { attributes: ['uuid', 'photo'] })
			.then((photo) => { 
				console.log(`Sending image ${photo}`); 
				res.status(http.StatusCodes.OK)
				.setHeader('Content-Type', 'image/png')
				.send(Buffer.from(photo.photo, 'base64'));
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


module.exports = router;
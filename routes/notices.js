var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');

/**
 * Notices CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	try {
        db.Notices.findAll().then((notices) => { 
            res.status(http.StatusCodes.OK).json(notices); 
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
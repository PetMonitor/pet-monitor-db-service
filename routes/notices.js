var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');

/**
 * Notices CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	try {
        db.Notices.findAll({
			include: [{
				model: db.Pets,
				required: false,
				include: [{
					model: db.PetPhotos,
					required: false,
					include: [{
						model: db.Photos,
						required: false
					}]
				}]
			}]
		}).then((notices) => {
			const resObj = notices.map(notice => {
				return Object.assign({},{
					uuid: notice.uuid,
					_ref: notice._ref,
					userId: notice.userId,
					noticeType: notice.noticeType,
					eventLocationLat: notice.eventLocationLat,
					eventLocationLong: notice.eventLocationLong,
					description: notice.description,
					eventTimestamp: notice.eventTimestamp,
					createdAt: notice.createdAt,
					updatedAt: notice.updatedAt,
					petId: notice.petId,
					petPhoto: notice.Pet.PetPhotos[0].Photo.lowResPhoto
				})
			});

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

module.exports = router;
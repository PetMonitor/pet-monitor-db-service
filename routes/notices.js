var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');
const {Op} = require("sequelize");

/**
 * Notices CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	let queryParams = {}
	if (req.query.petType != null) {
		queryParams.petType = req.query.petType
	}
	if (req.query.petSex != null) {
		queryParams.petSex = req.query.petSex
	}
	 if (req.query.noticeType != null) {
		 queryParams.noticeType = req.query.noticeType.split(',')
	 }

	let petOptions = {
		model: db.Pets,
		required: true,
		include: [{
			model: db.PetPhotos,
			required: true,
			include: [{
				model: db.Photos,
				required: true
			}]
		}]
	}
	let noticeOptions = {}
	if (!isEmptyObject(queryParams)) {
		let where = {}
		if (queryParams.petType != null && !isEmptyObject(queryParams.petType)) {
			where.type = queryParams.petType
		}
		if (queryParams.petSex != null && !isEmptyObject(queryParams.petSex)) {
			where.sex = queryParams.petSex
		}
		if (!isEmptyObject(where)) {
			petOptions.where = where
		}
		if (queryParams.noticeType != null && !isEmptyObject(queryParams.noticeType)) {
			noticeOptions.where = {
				noticeType: {
					[Op.or]: queryParams.noticeType
				}
			}
		}
	}
	noticeOptions.include = [petOptions]
	try {
        db.Notices.findAll(noticeOptions).then((notices) => {
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

function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}

module.exports = router;
var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');
const { Op } = require("sequelize");

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
	if (req.query.petBreed != null) {
		queryParams.petBreed = req.query.petBreed
	}
	if (req.query.noticeType != null) {
		queryParams.noticeType = req.query.noticeType.split(',')
	}
	if (req.query.noticeRegion != null) {
		queryParams.noticeRegion = req.query.noticeRegion
	}

	let petOptions = {
		model: db.Pets,
		required: true,
		include: [{
			model: db.PetPhotos,
			required: true,
			include: [{
				model: db.Photos,
				required: false
			}]
		}]
	}
	let noticeOptions = {}

	if (req.query.radiusKm != null && req.query.latitude && req.query.longitude) {
		let withinRadiusQuery = db.sequelize.fn(
			 'ST_DWithin',
			 db.sequelize.col('eventCoordinates'),
			 db.sequelize.fn('ST_GeographyFromText',
				 `POINT(${req.query.longitude} ${req.query.latitude})`),
			 parseInt(req.query.radiusKm) * 1000);

		noticeOptions.where = withinRadiusQuery
	 }
	if (!isEmptyObject(queryParams)) {
		let where = {}
		if (queryParams.petType != null && !isEmptyObject(queryParams.petType)) {
			where.type = queryParams.petType
		}
		if (queryParams.petSex != null && !isEmptyObject(queryParams.petSex)) {
			where.sex = queryParams.petSex
		}
		if (queryParams.petBreed != null && !isEmptyObject(queryParams.petBreed)) {
			where.breed = {
				[Op.iLike]: queryParams.petBreed
			}
		}
		if (!isEmptyObject(where)) {
			petOptions.where = where
		}

		let noticeTypeCondition
		let regionCondition
		if (queryParams.noticeType != null && !isEmptyObject(queryParams.noticeType)) {
			noticeTypeCondition = {
				noticeType: {
					[Op.or]: queryParams.noticeType
				}
			}
		}

		if (queryParams.noticeRegion != null && !isEmptyObject(queryParams.noticeRegion)) {
			regionCondition = {
				[Op.or]: [
					{
						street: {
							[Op.iLike]: `%${queryParams.noticeRegion}%`
						}
					},
					{
						neighbourhood: {
							[Op.iLike]: `%${queryParams.noticeRegion}%`
						}
					},
					{
						locality: {
							[Op.iLike]: `%${queryParams.noticeRegion}%`
						}
					},
					{
						country: {
							[Op.iLike]: `%${queryParams.noticeRegion}%`
						}
					}
				]
			}
		}

		if (noticeTypeCondition != null && regionCondition != null) {
			noticeOptions.where = {...noticeTypeCondition, ...regionCondition}
		} else if (noticeTypeCondition != null) {
			noticeOptions.where = noticeTypeCondition
		} else if (regionCondition != null) {
			noticeOptions.where = regionCondition
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
					eventLocationLat: notice.eventCoordinates.coordinates[1],
					eventLocationLong: notice.eventCoordinates.coordinates[0],
					street: notice.street,
					neighbourhood: notice.neighbourhood,
					locality: notice.locality,
					country: notice.country,
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

function isEmptyObject(object) {
	return Object.keys(object).length === 0
}

module.exports = router;
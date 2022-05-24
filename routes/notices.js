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
		required: false,
		include: [{
			model: db.PetPhotos,
			required: false,
			include: [{
				model: db.Photos,
				required: false
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
		if (queryParams.petBreed != null && !isEmptyObject(queryParams.petBreed)) {
			where.breed = {
				[Op.iLike]: queryParams.petBreed
			}
		}
		if (!isEmptyObject(where)) {
			petOptions.where = where
		}

		let noticeConditions = []
		let noticeTypeCondition
		let regionCondition
		let withinRadiusCondition
		if (queryParams.noticeType != null && !isEmptyObject(queryParams.noticeType)) {
			noticeConditions.push({
				noticeType: {
					[Op.or]: queryParams.noticeType
				}
			})
		}

		if (queryParams.noticeRegion != null && !isEmptyObject(queryParams.noticeRegion)) {
			noticeConditions.push({
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
			})
		}

		if (req.query.radiusKm != null && req.query.latitude != null && req.query.longitude != null) {
			withinRadiusCondition = db.sequelize.fn(
				'ST_DWithin',
				db.sequelize.col('eventCoordinates'),
				db.sequelize.fn('ST_GeographyFromText',
					`POINT(${req.query.longitude} ${req.query.latitude})`),
				parseInt(req.query.radiusKm) * 1000);
			if (noticeConditions.length === 0) {

			}
		}

		// noticeOptions.where = {
		// 	[Op.and]: [
		// 		noticeTypeCondition,
		// 		regionCondition,
		// 		db.sequelize.where(withinRadiusCondition, {[Op.is]: true})
		// 	]}

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
					petPhoto: notice.Pet.PetPhotos[0].Photo.photo
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

router.get('/:noticeId', async (req, res) => {
	try {
		db.Notices.findOne({
			where: {
			    uuid: req.params.noticeId
            },
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
		}).then((notice) => {

			const resObj = Object.assign({},{
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
				petPhoto: notice.Pet.PetPhotos[0].Photo.photo
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

module.exports = router;
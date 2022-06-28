var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');
const { Op } = require("sequelize");
const { isEmptyObject } = require("../utils/common");

/**
 * Notices CRUD endpoints.
 */

router.get('/', async (req, res) => {
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
		}],
		where: getPetFilterConditions(req.query)
	}

	let noticeOptions = {
		include: [petOptions],
		where: getNoticeFilterConditions(req.query),
		...getPagination(req.query)
	}

	try {
        db.Notices.findAll(noticeOptions).then(notices => {
			const resObj = notices.map(notice => {
				return Object.assign({}, mapToDomain(notice))
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
		}).then(notice => {
			const resObj = Object.assign({}, mapToDomain(notice))
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

function getPetFilterConditions(queryParams) {
	let where = {}
	if (!isEmptyObject(queryParams.petType)) {
		where.type = queryParams.petType
	}
	if (!isEmptyObject(queryParams.petSex)) {
		where.sex = queryParams.petSex
	}
	if (!isEmptyObject(queryParams.petBreed)) {
		where.breed = {
			[Op.iLike]: queryParams.petBreed
		}
	}
	return where;
}

function getPagination(queryParams) {
	let pagination = {}
	if (!isEmptyObject(queryParams.size)) {
		let size = parseInt(queryParams.size)
		pagination.limit = size
		if (!isEmptyObject(queryParams.page)) {
			pagination.offset = (parseInt(queryParams.page) - 1) * size
		}
	}
	return pagination;
}

function getNoticeFilterConditions(queryParams) {
	let noticeConditions = []

	if (!isEmptyObject(queryParams.noticeType)) {
		noticeConditions.push(getNoticeTypeFilter(queryParams))
	}

	if (!isEmptyObject(queryParams.noticeRegion)) {
		noticeConditions.push(getNoticeRegionFilter(queryParams))
	}

	if (queryParams.radiusKm != null && queryParams.latitude != null && queryParams.longitude != null) {
		noticeConditions.push(getNoticeLocationWithinRadiusFilter(queryParams))
	}
	return {[Op.and]: [...noticeConditions]};
}

function getNoticeTypeFilter(queryParams) {
	return {
		noticeType: {
			[Op.or]: queryParams.noticeType.split(',')
		}
	};
}

function getNoticeRegionFilter(queryParams) {
	return {
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
	};
}

function getNoticeLocationWithinRadiusFilter(queryParams) {
	let withinRadiusCondition = db.sequelize.fn(
		'ST_DWithin',
		db.sequelize.col('eventCoordinates'),
		db.sequelize.fn('ST_GeographyFromText',
			`POINT(${queryParams.longitude} ${queryParams.latitude})`),
		parseInt(queryParams.radiusKm) * 1000);
	return db.sequelize.where(withinRadiusCondition, {[Op.is]: true});
}

function mapToDomain(notice) {
	return {
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
	};
}

module.exports = router;
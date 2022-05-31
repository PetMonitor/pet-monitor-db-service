var express = require('express');

var http = require('http-status-codes');
const db = require('../models/index.js');
const logger = require('../utils/logger.js');

var router = express.Router({mergeParams: true});

/**
 * User's notices CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	try {
        db.Notices.findAll({ 
			where: { 
				userId: req.params.userId 
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
		}).then((notices) => {
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

router.get('/:noticeId', async (req, res) => {
	try {
		db.Notices.findOne({ 
			where: { 
			    uuid: req.params.noticeId, 
			    userId: req.params.userId 
            }
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
			});
			res.status(http.StatusCodes.OK).json(resObj);
		}).catch(err => {
			this.logger.error(err);
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
		console.log(`Creating notice ${req.body.uuid}`);
		db.Notices.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			petId: req.body.petId,
            userId: req.params.userId,
			noticeType: req.body.noticeType,
			eventCoordinates: db.sequelize.fn('ST_GeographyFromText', `SRID=4326;POINT (${req.body.eventLocationLong} ${req.body.eventLocationLat})`),
			street: req.body.street,
			neighbourhood: req.body.neighbourhood,
			locality: req.body.locality,
			country: req.body.country,
			description: req.body.description,
            eventTimestamp: req.body.eventTimestamp,
			createdAt: new Date(),
			updatedAt: new Date()
		}).then((notice) => {
		    res.status(http.StatusCodes.CREATED).json(notice); 
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

router.put('/:noticeId', async (req, res) => {
	try {
		//TODO: check for _ref
		logger.info(`Updating notice ${req.params.noticeId} with content ${JSON.stringify(req.body)}`)
        var updatedNoticeFields = req.body
        updatedNoticeFields['updatedAt'] = new Date();

		if (req.body.eventLocationLong != undefined && req.body.eventLocationLat != undefined) {
			updatedNoticeFields['eventCoordinates'] = db.sequelize.fn('ST_GeographyFromText', `SRID=4326;POINT (${req.body.eventLocationLong} ${req.body.eventLocationLat})`)
		}

		db.Notices.update(updatedNoticeFields, {
			where: { 
				uuid: req.params.noticeId,
				userId: req.params.userId 
			}
		}).then((result) => {
		    res.status(http.StatusCodes.OK).json(result); 
		}).catch(err => {
			logger.error(`Update notice ${req.params.noticeId} failed with error ${err}`)
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

router.delete('/:noticeId', async (req, res) => {
	try {
        db.Notices.destroy({ 
			where: { 
				uuid: req.params.noticeId,
                userId: req.params.userId
			}
		}).then((deletedCount) => {
		    res.status(http.StatusCodes.OK).json(deletedCount); 
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
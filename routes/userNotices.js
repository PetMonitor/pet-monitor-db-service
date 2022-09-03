var express = require('express');

var http = require('http-status-codes');
const db = require('../models/index.js');
const logger = require('../utils/logger.js');
const emails = require('../utils/emails.js');
const translations = require('../utils/translations.js');

const { Op } = require("sequelize");

var router = express.Router({mergeParams: true});

const EXPO_METRO_SERVER_URI = process.env.EXPO_METRO_SERVER_URI || 'http://127.0.0.1:19000';
const ALERT_RADIUS_MTS =  5000;

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
			logger.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
  	} catch (err) {
  		logger.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
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
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
  	} catch (err) {
  		logger.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	  });
  	} 
});

router.post('/', async (req, res) => {
    try {
		logger.info(`Creating notice ${req.body.uuid}`);
		const newNotice = await db.Notices.create({
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
		});

		logger.info(`Created notice ${JSON.stringify(newNotice)}.`);

		const usersToNotify = await db.Users.findAll({
			where: {
				[Op.and]: [
					{ uuid:  { [Op.not]: req.params.userId } },
					{ alertsActivated: true  },
					{ alertsForReportTypes: { [Op.like]: `%${req.body.noticeType}%` } },
					getUsersWithinRadiusFilter(req.body.eventLocationLat, req.body.eventLocationLong, ALERT_RADIUS_MTS)
				]
			},
			attributes: [ 'email', 'username' ]
		})

		logger.info(`Notifying users ${JSON.stringify(usersToNotify)}`);

		const deeplinkBaseUri = `exp://${EXPO_METRO_SERVER_URI}/--/users`;

		const petInfo = await db.Pets.findOne({ where: { uuid: req.body.petId }});
		const petName = petInfo.name != null && petInfo.name.length > 0 ? petInfo.name : '-';
		const petFurColor = petInfo.furColor != null && petInfo.furColor.length > 0 ? petInfo.furColor : '-';
        const dateTime = new Date().toISOString().split('.')[0].replace('T',' ');
		const deeplink =  deeplinkBaseUri + `/${req.params.userId}/reports/${newNotice.uuid}`;

		const replacements = {
			titleStyle: translations.classTitleMatcher[newNotice.noticeType].cssClass,
			title: `${translations.petTranslationMatcher[petInfo.type].translation} ${translations.classTitleMatcher[newNotice.noticeType].translation}`,
			petName: petName,
			petFurColor: petFurColor,
			petSex: translations.petTranslationMatcher[petInfo.sex].translation,
			petSize: translations.petTranslationMatcher[petInfo.size].translation,
			petLifeStage: translations.petTranslationMatcher[petInfo.lifeStage].translation,
			description: petInfo.description.length > 0 ? petInfo.description : '-',
			location: `${newNotice.locality} ,  ${newNotice.neighbourhood} , ${newNotice.street}`,
			dateTime: dateTime,
			deeplink: deeplink
		}

		logger.info(`Replacements ${JSON.stringify(replacements)}`);

		usersToNotify.forEach(user => {
			emails.sendEmail(
				user.email, 
				'Pet Monitor: nuevo reporte cerca tuyo!',
				'../static/newReportAlertEmailTemplate.html',
				{ 
					recipientUsername: user.username,
					...replacements
				},
				[translations.petTranslationMatcher[petInfo.type].icon]
			)
		});

		return res.status(http.StatusCodes.CREATED).json(newNotice); 
	} catch (err) {
		logger.error(err);
		return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	}
});

function getUsersWithinRadiusFilter(pointLat, pointLong, radiusMts) {
	let withinRadiusCondition = db.sequelize.fn(
		'ST_DWithin',
		db.sequelize.col('alertCoordinates'),
		db.sequelize.fn('ST_GeographyFromText',
			`POINT(${pointLong} ${pointLat})`),
		radiusMts);
	return db.sequelize.where(withinRadiusCondition, {[Op.is]: true});
}

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
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		logger.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
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
			logger.error(err);
			res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
			  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
			});
		});
	} catch (err) {
		logger.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
		  error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	} 
});

module.exports = router;
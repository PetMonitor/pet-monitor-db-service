var express = require('express');

var http = require('http-status-codes');
const db = require('../models/index.js');
const logger = require('../utils/logger.js');
const { isEmptyObject } = require("../utils/common");
const {Op} = require("sequelize");

var router = express.Router({mergeParams: true});

/**
 * Foster volunteer profiles CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
		const queryParams = req.query;
		let profileConditions = [];
		if (!isEmptyObject(queryParams.userId)) {
			profileConditions.push({ userId: queryParams.userId });
		}
		if (!isEmptyObject(queryParams.available)) {
			profileConditions.push({ available: queryParams.available });
		}
		if (!isEmptyObject(queryParams.profileRegion)) {
			profileConditions.push(getProfileRegionFilter(queryParams.profileRegion))
		}

        db.FosterVolunteerProfiles.findAll({
			where: {[Op.and]: [...profileConditions]}
		}).then((profiles) => {
			logger.info(`Returning foster volunteer profiles ${JSON.stringify(profiles)}`);
            res.status(http.StatusCodes.OK).json(profiles);
        }).catch(err => {
			logger.error(err);
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
});

router.get('/:profileId', async (req, res) => {
	try {
		db.FosterVolunteerProfiles.findOne({
			where: { 
			    uuid: req.params.profileId,
            }
		}).then((profile) => {
			if (profile != null) {
				logger.info(`Returning foster volunteer profile ${JSON.stringify(profile)}`);
				res.status(http.StatusCodes.OK).json(profile);
			} else {
				res.status(http.StatusCodes.NOT_FOUND).send({
					error: `No profile found for id ${req.params.profileId}`
				});
			}
		}).catch(err => {
			logger.error(err);
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
});

router.post('/', async (req, res) => {
    try {
		logger.info(`Creating foster volunteer profile ${req.body.uuid}`);
		db.FosterVolunteerProfiles.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
            userId: req.body.userId,
			petTypesToFoster: req.body.petTypesToFoster,
			petSizesToFoster: req.body.petSizesToFoster,
			location: req.body.location,
			province: req.body.province,
			additionalInformation: req.body.additionalInformation,
			available: req.body.available,
			averageRating: req.body.averageRating,
			ratingAmount: req.body.ratingAmount,
			createdAt: new Date(),
			updatedAt: new Date()
		}).then((profile) => {
		    res.status(http.StatusCodes.CREATED).json(profile);
		}).catch(err => {
			logger.error(err);
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
});

router.put('/:profileId', async (req, res) => {
	try {
		//TODO: check for _ref
        var updatedProfileFields = req.body
		updatedProfileFields['updatedAt'] = new Date();
		db.FosterVolunteerProfiles.update(updatedProfileFields, {
			where: { 
				uuid: req.params.profileId
			},
			returning: true,
			plain: true
		}).then((result) => {
		    res.status(http.StatusCodes.OK).json(result[1].dataValues);
		}).catch(err => {
			logger.error(err);
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
});

router.delete('/:profileId', async (req, res) => {
	try {
        db.FosterVolunteerProfiles.destroy({
			where: { 
				uuid: req.params.profileId,
			}
		}).then((deletedCount) => {
		    res.status(http.StatusCodes.OK).json(deletedCount); 
		}).catch(err => {
			logger.error(err);
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
});

function getProfileRegionFilter(profileRegion) {
	return {
		[Op.or]: [
			{
				location: {
					[Op.iLike]: `%${profileRegion}%`
				}
			},
			{
				province: {
					[Op.iLike]: `%${profileRegion}%`
				}
			}
		]
	};
}

module.exports = router;

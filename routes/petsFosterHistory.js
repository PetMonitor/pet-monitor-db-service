var express = require('express');

var http = require('http-status-codes');
const db = require('../models/index.js');
const logger = require('../utils/logger.js');

var router = express.Router({mergeParams: true});

/**
 * Pets' foster history CRUD endpoints.
 */

router.get('/', async (req, res) => {
	try {
        db.PetsFosterHistory.findAll({
			where: {
				petId: req.params.petId
			}
		}).then(history => {
			logger.info(`Returning pet's foster history ${JSON.stringify(history)}`);
			res.status(http.StatusCodes.OK).json(history);
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

router.get('/:historyId', async (req, res) => {
	try {
		db.PetsFosterHistory.findOne({
			where: {
				uuid: req.params.historyId,
				petId: req.params.petId
			}
		}).then((entry) => {
			if (entry != null) {
				logger.info(`Returning pet's foster history entry ${JSON.stringify(entry)}`);
				res.status(http.StatusCodes.OK).json(entry);
			} else {
				res.status(http.StatusCodes.NOT_FOUND).send({
					error: `No history entry found for id ${req.params.historyId}`
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
		logger.info(`Creating pet's foster history entry ${req.body.uuid}`);
		db.PetsFosterHistory.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
            petId: req.body.petId,
			userId: req.body.userId,
			contactEmail: req.body.contactEmail,
			contactPhone: req.body.contactPhone,
			contactName: req.body.contactName,
			sinceDate: req.body.sinceDate,
			untilDate: req.body.untilDate,
			createdAt: new Date(),
			updatedAt: new Date()
		}).then((history) => {
		    res.status(http.StatusCodes.CREATED).json(history);
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

router.put('/:historyId', async (req, res) => {
	try {
		//TODO: check for _ref
        var updatedHistoryFields = req.body
		updatedHistoryFields['updatedAt'] = new Date();
		db.PetsFosterHistory.update(updatedHistoryFields, {
			where: { 
				uuid: req.params.historyId,
				petId: req.params.petId
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

router.delete('/:historyId', async (req, res) => {
	try {
        db.PetsFosterHistory.destroy({
			where: { 
				uuid: req.params.historyId,
				petId: req.params.petId
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

module.exports = router;

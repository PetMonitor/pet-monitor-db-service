var express = require('express');


const db = require('../models/index.js');
var http = require('http-status-codes');
const logger = require('../utils/logger.js');
const commons = require('../utils/common.js');
const uuid = require('uuid');

var router = express.Router({mergeParams: true});


router.post('/failure/:searchedNoticeId', async (req, res) => {
    try {
		logger.info(`Creating prediction feedback log entry for notice id ${req.params.searchedNoticeId} and ids ${JSON.stringify(req.body)}`);
		db.PredictionFeedbackLog.create({
            uuid: uuid.v4(),
            searchedNoticeId: req.params.searchedNoticeId,
            predictedNoticeIds: JSON.stringify(req.body.predictedNoticeIds),
            predictionResult: commons.PREDICTION_STATUS.FAILED,
            createdAt: new Date(),
            updatedAt: new Date()
        }).then((result) => {
            res.status(http.StatusCodes.CREATED).json(result); 
        })
    } catch(err) {
        logger.error(`Creating prediction feedback log entry failed for notice id ${req.params.searchedNoticeId} ${err}`);
        res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
            error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });
    }
})

module.exports = router;

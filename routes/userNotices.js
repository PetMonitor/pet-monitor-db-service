var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
const db = require('../models/index.js');

var router = express.Router({mergeParams: true});

/**
 * User's notices CRUD endpoints.
 */

 router.get('/', async (req, res) => {
	try {
        db.Notices.findAll({ 
			where: { 
				userId: req.params.userId 
			}
		}).then((notices) => { 
            res.status(http.StatusCodes.OK).json(notices); 
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
			res.status(http.StatusCodes.OK).json(notice); 
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

router.post('/', async (req, res) => {
    try {
		console.log(`Creating notice ${req.body.uuid}`);
		db.Notices.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			petId: req.body.petId,
            userId: req.params.userId,
			noticeType: req.body.noticeType,
			eventLocationLat: req.body.eventLocationLat,
            eventLocationLong: req.body.eventLocationLong,
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
        var updatedNoticeFields = req.body
        updatedNoticeFields['updatedAt'] = new Date();
        db.Notices.update(updatedNoticeFields, { 
			where: { 
				uuid: req.params.noticeId,
				userId: req.params.userId 
			}
		}).then((result) => {
		    res.status(http.StatusCodes.OK).json(result); 
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
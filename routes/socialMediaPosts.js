var express = require('express');

var http = require('http-status-codes');
const db = require('../models/index.js');
const axios = require('axios').default; 
const moment = require('moment');
const { Op } = require("sequelize");

const commons = require('../utils/common.js');

var router = express.Router({ mergeParams: true });

/**
* Facebook Posts CRUD endpoints.
*/

// Create facebook post record
router.post('/', async (req, res) => {

	const images = []
	for (var i = 0; i < req.body.images.length; i++) {
		images.push(Object.assign({}, {
			uuid: req.body.images[i].uuid,
			photo: await getImageAsBase64(req.body.images[i].src)
		}))
	}

	let resEmbeddings = await commons.getEmbeddingsForDogPhotos(images);

	const tx = await db.sequelize.transaction();
	
	try {
		console.log(`Storing facebook post with id ${req.body.postId}`);

		const fbPost = await db.FacebookPosts.create({
			uuid: req.body.uuid,
			_ref: req.body._ref,
			postId: req.body.postId,
			url: req.body.url,
			message: req.body.message,
			noticeType: req.body.type,
			eventTimestamp: req.body.eventTimestamp,
			location: req.body.location,
			createdAt: new Date(),
			updatedAt: new Date()
		}, { transaction: tx });

		const postEmbeddings = []
		for (var i = 0; i < req.body.images.length; i++) {
			console.log(`Processing image... ${JSON.stringify(req.body.images[i])}`);

			const postEmbedding = {
				uuid: req.body.images[i]["uuid"],
				postId: fbPost.uuid,
				photoId: req.body.images[i]["photoId"],
				url: req.body.images[i]["url"],
				embedding: resEmbeddings.data.embeddings[req.body.images[i]["uuid"]],
				createdAt: new Date(),
				updatedAt: new Date()
			}
			postEmbeddings.push(postEmbedding);

			console.log(`Processing image embedding ${JSON.stringify(postEmbedding)}`);

		}

		console.log(`Creating embeddings ${JSON.stringify(postEmbeddings.length)}`);

		await db.FacebookPostsEmbeddings.bulkCreate(postEmbeddings, { transaction: tx });

		await tx.commit();
		return res.status(http.StatusCodes.CREATED).json(fbPost); 

  	} catch (err) {
		await tx.rollback();
  		console.error(err);
  		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
  	} 
});

// Receives a list of post ids.
// Returns a sublist with the post ids that are not present
// in the database.
router.post('/processed/filter', async (req, res) => {
	try {
		const postIds = req.body.postIds;
		console.log(`Processing ids list ${postIds}`);

		const processedIds = await db.FacebookPosts.findAll({
			attributes: ['postId'],
			where: {
				postId: postIds
			},
			raw: true
		})
		//.then(records => records.map(record => record.postId));

		for (var i = 0; i < processedIds.length; i++) {
			processedIds[i] = processedIds[i].postId;
		}

		console.log(`Query returned processed post ids ${JSON.stringify(processedIds)}`)

		const unprocesedIds = postIds.filter(postId => !processedIds.includes(postId)); 

		console.log(`Returning unprocessed Ids ${unprocesedIds.toString()}`)
		return res.status(http.StatusCodes.CREATED).json({ 
			postIds: unprocesedIds
		}); 
	} catch (err) {
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	}
})

router.delete('/', async (req, res) => {
	try {
		if (!req.query.beforeDate) {
			return res.status(http.StatusCodes.CREATED).json({ deleted: 0 }); 
		}

		const beforeDate = moment(req.query.beforeDate, 'YYYY-MM-DD');
		

		console.log(`Removing posts created before ${beforeDate}`);

		const deleted = await db.FacebookPosts.destroy({ 
			where: {
				createdAt: {
					[Op.lt]: beforeDate.toString()
				}
			}
		});

		return res.status(http.StatusCodes.CREATED).json({ deleted: deleted }); 

	} catch (err) {
		console.error(err);
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
			error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
	    });
	}
});


async function getImageAsBase64(imgUrl) {
	try {
		const res = await axios.get(imgUrl, {
			responseType: 'arraybuffer'
		  });
		return Buffer.from(res.data, 'binary').toString('base64');
	} catch(err) {
		console.err(err);
	}
}

module.exports = router;
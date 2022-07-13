const axios = require('axios').default; 
const crypto = require('crypto');

const FACE_REC_PORT = process.env.FACE_REC_PORT || '5001';
const FACE_REC_SERVICE_URL = `http://host.docker.internal:${FACE_REC_PORT}/api/v0/dogs/embedding`;

const PREDICTION_STATUS = {
    FAILED: 'FAILED',
}

async function getEmbeddingsForDogPhotos(photos) {
	return axios.post(FACE_REC_SERVICE_URL, 
		{
			dogs: photos
		}, 
		{
			maxContentLength: Infinity,
			maxBodyLength: Infinity
		}
	);
}

function isEmptyObject(object) {
	return object == null || Object.keys(object).length === 0
}

function generateSecureToken(tokenLength) {
	return crypto.randomBytes(tokenLength).toString('hex');;
}


module.exports = {
	getEmbeddingsForDogPhotos: getEmbeddingsForDogPhotos,
	isEmptyObject: isEmptyObject,
	generateSecureToken: generateSecureToken,
	PREDICTION_STATUS: PREDICTION_STATUS
}

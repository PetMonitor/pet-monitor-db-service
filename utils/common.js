const axios = require('axios').default; 

const FACE_REC_PORT = process.env.FACE_REC_PORT || '5001';
const FACE_REC_SERVICE_URL = `http://host.docker.internal:${FACE_REC_PORT}/api/v0/dogs/embedding`;

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
};

module.exports.getEmbeddingsForDogPhotos = getEmbeddingsForDogPhotos;
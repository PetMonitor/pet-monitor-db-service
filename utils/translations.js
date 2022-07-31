const fs = require('fs');
const path = require('path');

const classLostStolen = 'lostStolenTitle';
const classFound = 'foundTitle';
const classAdoption = 'adoptionTitle';

const petTranslationMatcher = { 
	"DOG": { 
		translation: 'PERRO', 
		icon: {
			filename: 'dog.png',
			path: path.resolve(__dirname,__dirname,'../assets/dog.png'),
			cid: 'petIcon' 
		},
		iconBase64: fs.readFileSync(path.resolve(__dirname, '../assets/dog.png'), {encoding: 'base64'}) 
	},
	"CAT": { 
		translation: 'GATO', 
		icon: {
			filename: 'cat.png',
			path: fs.readFileSync(path.resolve(__dirname,'../assets/cat.png')),
			cid: 'petIcon' 
		},
		iconBase64: fs.readFileSync(path.resolve(__dirname,'../assets/cat.png'), {encoding: 'base64'}) 
	},
	"ADULT": { translation: 'ADULTO' },
	"BABY": { translation: 'CACHORRO' },
	"SENIOR": { translation: 'MAYOR' },
	"SMALL": { translation: 'PEQUEÑO' },
	"MEDIUM": { translation: 'MEDIANO' },
	"LARGE": { translation: 'GRANDE' },
	"MALE": { translation: 'MACHO' },
	"FEMALE": { translation: 'HEMBRA' },
}

const classTitleMatcher = { 
	"LOST": { cssClass: classLostStolen, translation: 'PERDIDO!' },
	"STOLEN": { cssClass: classLostStolen, translation: 'ROBADO!' },
	"FOUND": { cssClass: classFound, translation: 'ENCONTRADO!' },
	"FOR_ADOPTION": { cssClass: classAdoption, translation: 'EN ADOPCIÓN!' }
}


module.exports = {
	petTranslationMatcher: petTranslationMatcher,
    classTitleMatcher: classTitleMatcher,
	classLostStolen: classLostStolen,
	classAdoption: classAdoption,
	classFound: classFound
}
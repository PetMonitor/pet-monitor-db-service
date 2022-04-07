var express = require('express');
var router = express.Router();
var http = require('http-status-codes');

const db = require('../models/index.js');

const path = require('path')
const {spawn} = require('child_process')

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

/**
 * Pet Finder endpoints
 */

router.get('/:petId', async (req, res) => {

    if (config.use_env_variable) {
        // TODO: connection string case should be considered
        console.log(`Using ENV database ${config.use_env_variable}`);
        const connString = process.env[config.use_env_variable];
        throw new Error("Connection using database string not supported in finder module.")
    } 
    
    console.log(`Using config ${config}`)
    const databaseCredentials = { 
        host: config.host,
        port: 5432,
        db: config.database, 
        username: config.username, 
        pwd: config.password 
    };

    console.log("About to spawn process...");
    
    getPredictedPets(databaseCredentials, req.params.petId)
    .then(data => {
        return res
        .send({ "foundPets": data })
        .status(http.StatusCodes.OK);
    })
    .catch(err => {
        return res
            .send(err.toString())
            .status(http.StatusCodes.INTERNAL_SERVER_ERROR);
    });

});

const getPredictedPets = (databaseCredentials, petId) => {
    var process = spawn('python', [ 
        path.join(__dirname, '/python/classifier.py'),
        JSON.stringify(databaseCredentials),
        petId
     ]);
    
     console.log("Process spawned!");
     const regexListContent = /(?<=\[).+?(?=\])/g;
     return new Promise((resolve, reject) => {
        process.stdout.on('data', (data) => {
            result = data.toString().match(regexListContent)[0].replaceAll("'","").replaceAll(" ","").split(",");

            console.log("Python process returned " + result);
            return result;
        });
        process.on('close', () => {
            resolve(result)
        });
        process.on('error', (err) => {
            reject(err)
        });
    });
}



module.exports = router;

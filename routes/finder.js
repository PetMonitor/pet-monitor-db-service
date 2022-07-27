var express = require('express');
var router = express.Router();
var http = require('http-status-codes');

const db = require('../models/index.js');

const path = require('path')
const {spawn} = require('child_process')
const {isEmptyObject} = require("../utils/common");

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

MIN_POSTS = 10

/**
 * Pet Finder endpoints
 */

router.get('/:noticeId', async (req, res) => {
    const noticeId = req.params.noticeId;
    const databaseCredentials = getDatabaseCredentials();

    const queryParams = req.query;
    let region = ''
    if (!isEmptyObject(queryParams.region)) {
        region = queryParams.region
    }
    getPredictedPets(databaseCredentials, '/python/classifier.py', noticeId, null, region)
    .then(data => {
        return res
        .send({ "closestMatches": data })
        .status(http.StatusCodes.OK);
    })
    .catch(err => {
        return res
            .send(err.toString())
            .status(http.StatusCodes.INTERNAL_SERVER_ERROR);
    });

});

router.get('/facebook/posts/:postId', async (req, res) => {
    const postId = req.params.postId;
    const databaseCredentials = getDatabaseCredentials();

    const totalPosts = await db.FacebookPosts.count();

    if (totalPosts < MIN_POSTS) {
        return res
        .send({ "foundPosts": [] })
        .status(http.StatusCodes.OK); 
    }

    //TODO: FILTER BY NOTICE TYPE (LOST, FOUND, NONE)
    
    getPredictedPets(databaseCredentials, '/python/facebookClassifier.py', postId)
    .then(async data => {

        const closestPosts = await db.FacebookPosts.findAll({
            where: {
                postId: data
            }
        })

        return res
        .send({ "foundPosts": closestPosts })
        .status(http.StatusCodes.OK);
    })
    .catch(err => {
        return res
            .send(err.toString())
            .status(http.StatusCodes.INTERNAL_SERVER_ERROR);
    });

});

function getDatabaseCredentials() {
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

    return databaseCredentials;
}

const getPredictedPets = (databaseCredentials, filePath, sqlCommandPetEmbeddings, sqlCommandExcludePetEmbeddings, region) => {
    console.log("About to spawn process...");

    var process = spawn('python', [ 
        path.join(__dirname, filePath),
        JSON.stringify(databaseCredentials),
        sqlCommandPetEmbeddings, 
        sqlCommandExcludePetEmbeddings,
        region
     ]);
    
     console.log("Process spawned!");
     const regexListContent = /(?<=\[).+?(?=\])/g;
     return new Promise((resolve, reject) => {
        process.stdout.on('data', (data) => {
            console.log(`Python process returned raw result ${data}`);

            let matchedIds = data.toString().match(regexListContent);
            console.log(matchedIds);
            if (matchedIds == null) {
                result = ""
            } else {
                result = matchedIds[0].replaceAll("'", "").replaceAll(" ", "").split(",");
            }

            console.log("Python process returned " + result);
            return result;
        });
        process.on('close', () => {
            resolve(result)
        });
        process.on('error', (err) => {
            console.error(err);
            reject(err)
        });
    });
}

module.exports = router;

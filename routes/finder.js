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
        .send({ "closestMatches": data["foundPosts"] })
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
        .send({ "foundPosts": [], "foundPostsFromRegion": [] })
        .status(http.StatusCodes.OK); 
    }

    const queryParams = req.query;
    let region = ''
    if (!isEmptyObject(queryParams.region)) {
        region = queryParams.region
    }

    getPredictedPets(databaseCredentials, '/python/facebookClassifier.py', postId, region)
    .then(async data => {
        let foundPostIds = data["foundPosts"]
        let foundPostIdsFromRegion = []
        if ("foundPostsFromRegion" in data) {
            foundPostIdsFromRegion = data["foundPostsFromRegion"]
        }

        const closestPosts = await db.FacebookPosts.findAll({
            where: {
                postId: foundPostIds.concat(foundPostIdsFromRegion)
            }
        })

        let foundPosts = []
        let foundPostsFromRegion = []
        closestPosts.map(value => {
            if (foundPostIds.includes(value.postId)) {
                foundPosts.push(value)
            } else if (foundPostIdsFromRegion.includes(value.postId)) {
                foundPostsFromRegion.push(value)
            }
        })

        return res
        .send({ "foundPosts": foundPosts, "foundPostsFromRegion": foundPostsFromRegion})
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
     return new Promise((resolve, reject) => {
        process.stdout.on('data', (data) => {
            console.log(`Python process returned raw result ${data}`);

            let formattedJson = data.toString().replace(/'/g, '"');
            let matchedPosts = JSON.parse(formattedJson)
            if (matchedPosts == null) {
                result = ""
            } else {
                result = matchedPosts;
            }

            console.log("Python process returned " + result.toString());
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

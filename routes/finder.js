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

    var process = spawn('python', [ 
        path.join(__dirname, '/python/classifier.py'),
        JSON.stringify(databaseCredentials),
        req.params.petId
     ]);

    console.log("Process spawned!");

    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
      
    // Takes stdout data from script which executed
    // with arguments and send this data to res object
    process.stdout.on('data', function(data) {
        return res.send(data.toString());
    });

});

module.exports = router;

var express = require('express');

const db = require('../models/index.js');
var http = require('http-status-codes');

var passwordHasher = require('../utils/passwordHasher.js');

var router = express.Router({mergeParams: true});

/**
 * User credentials validation endpoint
 */

router.post('/', async (req, res) => {
    try {
        userCredentials = req.body

        let searchCriteria = {}

        if (req.body.facebookId) {
            searchCriteria = { facebookId: req.body.facebookId }
        } else {
            searchCriteria = { 
                username: userCredentials['username'],
                password: passwordHasher(userCredentials['password'])
            } 
        }


        db.Users.findOne({ 
            attributes: ['uuid', '_ref', 'username', 'email', 'name', 'phoneNumber', 'alertRadius', 'alertsActivated', 'profilePicture'],
            where: { 
                ...searchCriteria
            } 
        }).then((user) => {
            if (user == null) {
                console.log(`No user ${userCredentials['username']} with provided credentials`)
                res.status(http.StatusCodes.UNAUTHORIZED).send({
                    error: `No user ${userCredentials['username']} with provided credentials`
                })
                return
            }

            console.log(`User ${userCredentials['username']} successfully authorized`)
            user['password'] = undefined
            res.status(http.StatusCodes.OK).json(user)
        }).catch(err =>{
            console.log(`Error validating user credentials ${err}`)
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
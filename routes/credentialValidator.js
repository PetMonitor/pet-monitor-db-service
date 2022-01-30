var express = require('express');

var router = express.Router();
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

        const hashedPwd = passwordHasher(userCredentials['password'])

        db.Users.findOne({ 
            attributes: ['uuid', '_ref', 'username', 'email'],
            where: { 
                username: userCredentials['username'],
                password: hashedPwd
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
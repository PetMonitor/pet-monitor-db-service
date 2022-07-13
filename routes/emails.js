var express = require('express');
var http = require('http-status-codes');
const emailUtils = require('../utils/emails.js');
const common = require('../utils/common.js');
const cache = require('../cache/cache.js');
const path = require('path');
const fs = require('fs');

var router = express.Router({ mergeParams: true });
const logger = require('../utils/logger.js');

const port = process.env.PORT || '8000';

const CONFIRMATION_EMAIL_SUBJECT = 'Pet Monitor: Confirmá tu email!';
const CONFIRMATION_LINK = `http://localhost:${port}/emails/confirmation`;
const EMAIL_TOKEN_PREFIX = 'emailConfirmationToken:';

// Give 24hs for the user to finish email setup
const EMAIL_CONFIRMED_TTL_SECONDS = 3600 * 24;
const EMAIL_TOKEN_LENGTH_BYTES = 48

/**
* Email endpoints.
*/

router.post('/confirmation', async (req, res) => {
    try {  	
        const emailAddress = req.body.emailAddress;
        const emailConfirmationToken = common.generateSecureToken(EMAIL_TOKEN_LENGTH_BYTES);

        await emailUtils.sendEmail(
            emailAddress, 
            CONFIRMATION_EMAIL_SUBJECT, 
            '../static/confirmationEmailTemplate.html',
            { "confirmationLink" : `${CONFIRMATION_LINK}/${emailConfirmationToken}` }
        );
        
        const emailConfirmationKey = EMAIL_TOKEN_PREFIX + emailConfirmationToken;
        logger.debug(`Caching email confirmation data ${emailAddress}: ${emailConfirmationKey}`);

        // store confirmation token in cache
        cache.set(emailConfirmationKey, emailAddress);

        res.status(http.StatusCodes.CREATED).send();
    } catch (err) {
        logger.error(`Failed to send confirmation email for user ${emailAddress}: ${err}`)
        res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });
    }
})

router.get('/confirmation/:confirmationToken', async (req, res) => {
    try {
        const confirmationToken = req.params.confirmationToken;
        const emailConfirmationKey = EMAIL_TOKEN_PREFIX + confirmationToken;

        const emailAddress = cache.get(emailConfirmationKey);

        if (!emailAddress) {
            logger.error(`Session expired for token ${confirmationToken}`);
            var sessionExpiredView = fs.readFileSync(path.resolve(__dirname, '../static/sessionExpiredView.html'), 'utf8');
            res.send(sessionExpiredView);
        }
        // If confirmation token available, then confirm email and return success view
        logger.info(`Email confirmed ${emailAddress}`);

        // After confirmation user gets more time to finix setup
        cache.set(emailAddress, true, EMAIL_CONFIRMED_TTL_SECONDS);

        var emailConfirmedView = fs.readFileSync(path.resolve(__dirname, '../static/emailVerifiedView.html'), 'utf8');
        res.send(emailConfirmedView);
    } catch (err) {
        logger.error(`Failed to confirm email for session token ${req.params.confirmationToken}: ${err}`)
        res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });        
    }
})

router.post('/confirmation/check', async (req, res) => {
    try {
        const emailAddress = req.body.emailAddress;
        const emailConfirmed = cache.get(emailAddress);

        res.status(http.StatusCodes.OK).send({ 
            confirmed: emailConfirmed != undefined
        });  

    } catch (error) {
        logger.error(`Failed to check if email ${req.body.emailAddress} was confirmed: ${err}`)
        res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });        
    }
    
})

module.exports = router;
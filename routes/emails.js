var express = require('express');

const fs = require('fs');
const path = require('path');
const db = require('../models/index.js');
var http = require('http-status-codes');
const emailUtils = require('../utils/emails.js');
const common = require('../utils/common.js');
const cache = require('../cache/cache.js');

var router = express.Router({ mergeParams: true });
const logger = require('../utils/logger.js');

const port = process.env.PORT || '8000';

const CONFIRMATION_EMAIL_SUBJECT = 'Pet Monitor: Confirmá tu email!';
const USER_TO_USER_EMAIL_SUBJECT = 'Pet Monitor: Recibiste un mensaje!'

const CONFIRMATION_LINK = `http://localhost:${port}/emails/confirmation`;
const EMAIL_TOKEN_PREFIX = 'emailConfirmationToken:';

// Give 24hs for the user to finish email setup
const EMAIL_CONFIRMED_TTL_SECONDS = 3600 * 24;
const EMAIL_TOKEN_LENGTH_BYTES = 48

/**
* Email endpoints.
*/

router.post('/', async (req, res) => {
    const sendTo = req.body.sendTo;
    const message = req.body.message;
    const senderContactEmail = req.body.contactEmail;
    const senderContactPhoneNumber = req.body.contactPhoneNumber;

    try {  	
        if (senderContactEmail.length == 0 && senderContactPhoneNumber.length == 0) {
            const errorMessage = 'Must provide at least one of "senderContactEmail" or "senderContactPhoneNumber"';
            logger.error(errorMessage);
            return res.status(http.StatusCodes.BAD_REQUEST).send({ 
                error: errorMessage
            });
        }

        const recipient = await db.Users.findOne({ where: { email: sendTo } })
        logger.info(`Recipient ${recipient}`);

        if (recipient == null) {
            const errorMessage = `Unable to find user with email address ${sendTo}`;
            logger.error(errorMessage);
            return res.status(http.StatusCodes.NOT_FOUND).send({ 
                error: errorMessage
            });
        }

        await emailUtils.sendEmail(
            sendTo, 
            USER_TO_USER_EMAIL_SUBJECT, 
            '../static/userToUserEmailTemplate.html',
            { 
                "recipientUsername" : recipient.username,
                "message" : message,
                "senderContactEmail" : senderContactEmail.length > 0 ? senderContactEmail : '-',
                "senderContactPhone" : senderContactPhoneNumber.length > 0 ? senderContactPhoneNumber : '-',
            }
        );
        
        logger.debug(`Sending email to ${sendTo}.`);

        res.status(http.StatusCodes.CREATED).send();
    } catch (err) {
        logger.error(`Failed to send email to user ${sendTo}: ${err}`)
        return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });
    }
})

router.post('/confirmation', async (req, res) => {
    const emailAddress = req.body.emailAddress;

    try {  	
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
        return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
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
            return res.status(http.StatusCodes.UNAUTHORIZED).send(sessionExpiredView);
        }
        // If confirmation token available, then confirm email and return success view
        logger.info(`Email confirmed ${emailAddress}`);

        // After confirmation user gets more time to finix setup
        cache.set(emailAddress, true, EMAIL_CONFIRMED_TTL_SECONDS);

        var emailConfirmedView = fs.readFileSync(path.resolve(__dirname, '../static/emailVerifiedView.html'), 'utf8');
        return res.status(http.StatusCodes.OK).send(emailConfirmedView);
    } catch (err) {
        logger.error(`Failed to confirm email for session token ${req.params.confirmationToken}: ${err}`)
        return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });        
    }
})

router.post('/confirmation/check', async (req, res) => {
    try {
        const emailAddress = req.body.emailAddress;
        const emailConfirmed = cache.get(emailAddress);

        return res.status(http.StatusCodes.OK).send({ 
            confirmed: emailConfirmed != undefined
        });  

    } catch (error) {
        logger.error(`Failed to check if email ${req.body.emailAddress} was confirmed: ${err}`)
        return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          error: http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) + ' ' + err 
        });        
    }
    
})

module.exports = router;
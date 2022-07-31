var express = require('express');

const db = require('../models/index.js');
const logger = require('../utils/logger.js');
const emailUtils = require('../utils/emails.js');
const translations = require('../utils/translations.js');

var http = require('http-status-codes');

var router = express.Router({ mergeParams: true });

const SIMILAR_PET_ALERT_EMAIL_SUBJECT = 'Alerta! Nuevos resultados para tu búsqueda!'
const EXPO_METRO_SERVER_URI = process.env.EXPO_METRO_SERVER_URI || 'http://127.0.0.1:19000';
const TOP_K_NOTIFICATIONS = 5;


router.post('/notices/closestMatches', async (req, res) => {
    try {
        const userId = req.body.userId;
        const closestMatches = req.body.closestMatches;
        const searchedNoticeId = req.body.noticeId;

        if (closestMatches.length == 0) {
            return res
            .send({ "sent": 0 })
            .status(http.StatusCodes.OK);
        }

        // Only send notifications for subset
        const topNotices = closestMatches.slice(0, TOP_K_NOTIFICATIONS)

        const userInfo = await db.Users.findByPk(userId, { attributes: ['username', 'email', 'name'] });
        const closestNotices = await db.Notices.findAll({ 
            where: { uuid: topNotices },
            include: [{
				model: db.Pets,
				required: false
			}] 
        });
        
        logger.info(`Sending notification to user ${JSON.stringify(userInfo)} of closest matches found for their notice ${searchedNoticeId}`);
        
        const deeplinkBaseUri = `exp://${EXPO_METRO_SERVER_URI}/--/users`;
        logger.info(`Using address ${deeplinkBaseUri}`);

        const emailHtml = buildNotificationEmail(deeplinkBaseUri, closestNotices);

        await emailUtils.sendEmailRawHtml(
            userInfo.email, 
            SIMILAR_PET_ALERT_EMAIL_SUBJECT, 
            emailHtml
        );

        return res
        .send({ "sent": closestNotices.length })
        .status(http.StatusCodes.OK);
    } catch(error) {
        logger.error(`Error occurred while attempting to notify user of closest matches found ${JSON.stringify(req.body)}: ${error}`)
        return res
        .send({ "error": error })
        .status(http.StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
});


function buildNotificationEmail(deeplinkBaseUri, closestNotices) {

    let deeplinks = '';
    
    for (var i = 0; i < closestNotices.length; i++) {

        logger.info(`Formatting notice ${JSON.stringify(closestNotices[i])}`)

        const reportOwnerId = closestNotices[i]['userId'];
        const reportId = closestNotices[i]['uuid'];
        const deeplink =  deeplinkBaseUri + `/${reportOwnerId}/reports/${reportId}`;
        const type = closestNotices[i]['noticeType'];
        const titleStyle = translations.classTitleMatcher[type].cssClass;

        const title = translations.petTranslationMatcher[closestNotices[i].Pet.type].translation  + ' ' + translations.classTitleMatcher[type].translation

        const icon = translations.petTranslationMatcher[closestNotices[i].Pet.type].iconBase64;

        logger.info(`Formatting notice ${JSON.stringify(closestNotices[i])}`)

        const description = closestNotices[i].Pet.description + ' ' + closestNotices[i]['description'];
        const location = closestNotices[i]['locality'] + ', ' + closestNotices[i]['neighbourhood'] + ', ' + closestNotices[i]['street'];
        const dateTime = closestNotices[i]['createdAt'].toISOString().split('.')[0].replace('T',' ');

        const petSex = translations.petTranslationMatcher[closestNotices[i].Pet.sex].translation;
        const petSize = translations.petTranslationMatcher[closestNotices[i].Pet.size].translation;
        const petLifeStage = translations.petTranslationMatcher[closestNotices[i].Pet.lifeStage].translation;
        const petName = closestNotices[i].Pet.name.length > 0 ? 
        `<tr><td colspan="1"><strong>Nombre:</strong></td><td colspan="2" class="description">${closestNotices[i].Pet.name}</td></tr> `  : '<tr></tr>';

        const furColour = closestNotices[i].Pet.furColor.length > 0 ? 
        `<tr><td colspan="1"><strong>Color de pelaje:</strong></td><td colspan="2" class="description">${closestNotices[i].Pet.furColor}</td></tr> `  : '<tr></tr>';


        deeplinks += `<tr class="blank_row" ></tr> <tr class="blank_row" ></tr>` +
            '<tr class="section" ><td colspan="1"><div class="image-wrapper"><img width="40" height="40" alt="My Image" src="data:image/jpeg;base64,'+ icon +'" /></div></td><td colspan="1"><strong class="' + titleStyle + '">' + title + '</strong></td> <td colspan="1"></td></tr> ' +
            `<tr class="blank_row" ></tr>` +

            `${petName}` + 
            `${furColour}` + 

            `<tr><td class="col">Sexo</td><td class="col">Tamaño</td><td class="col">Edad</td></tr>` +
            `<tr class="description"><td class="col">${petSex}</td><td class="col">${petSize}</td><td class="col">${petLifeStage}</td></tr>` +

            `<tr><td colspan="3"><strong>Descripción</strong></td></tr> ` + 
            `<tr><td colspan="3" class="description"><p>${description.length > 0 ? description : ' -' } </p></td></tr> ` + 

            `<tr><td colspan="1"><strong>Ubicación:</strong></td> ` + 
            `<td colspan="2" class="description">${location}</td></tr> ` + 

            `<tr><td colspan="1" ><strong>Fecha y hora:</strong></td><td colspan="2" class="description">${dateTime}</td></tr> ` + 
            `<tr><td colspan="3" class="wrapper"><a class="confirmation-button" href="${deeplink}">Ver en la app</a></td></tr>` 
    }

    const emailHtml = '<!DOCTYPE html> <html lang="en">' +
        '<head>' +
        '<style>html, ' +
            'body { padding: 0; margin: 0; font-family: "Roboto"; sans-serif; } ' +
            '.content { width: 100%; background-color: #f7f9fa; position: relative; box-sizing: border-box; } ' +
            '.content-email { width: 100%; background-color: white; max-width: 600px; height: auto; position: relative; left: 0; right: 0; margin: 0px auto; margin: 0px auto; } ' +
            'header { padding: 32px; text-align: center; background-color: #73B1A2; margin-bottom: 48px;} ' +
            'p { margin: 15px; align-content: center; text-align: justify; color: #727375; font-family: "Roboto"; sans-serif; } ' +
            'h3 { margin: 15px; color: rgba(0, 0, 0, 0.6) } ' +
            '.wrapper { text-align: center;  padding: 20px; padding-top: 30px; } .image-wrapper { text-align: center;  } ' +
            '.confirmation-button { padding: 15px; width: 25%; border: none; background-color: #73B1A2; } ' +
            'a {color: white !important; font-family: "Roboto"; text-decoration: none !important; } ' +
            '.logo-wrapper { margin-left: 5%; } ' +
            `.${translations.classLostStolen} { font-size: 20px; text-align:center; margin: 10px; margin-bottom: 40px; padding-bottom: 40px;  color: #EB7568 } ` +
            `.${translations.classFound} { font-size: 20px; text-align:center; margin: 10px;  margin-bottom: 40px;  padding-bottom: 40px; color: #73B1A2; } ` +
            `.${translations.classAdoption} { font-size: 20px; text-align:center; margin: 10px;  margin-bottom: 40px;  padding-bottom: 40px; color: #FFD966 } ` +
            `.description { text-align:left; font-family: "Roboto"; margin: 10px; color: #5b5b5b } ` +
            `.section { margin-top: 40px; padding-top: 40px; } ` +
            `.col { padding-right: 40px; padding-top: 10px; padding-bottom: 10px;} .blank_row { height: 10px !important; border-bottom: 1pt solid grey; } ` +


        '</style>' +
        '</head>' +
        '</head>' +
        '<body>' +
            '<div class="content">' +
                '<div class="content-email">' +
                    '<header><div class="logo-wrapper"><img src="cid:logo" alt="Logo" title="Logo" width="175" height="100"/></div></header>' +
                    '<table width="100%" border="0" cellspacing="0" cellpadding="0" border-collapse: "collapse">' +
                        '<tr><h3>Buenas Noticias!</h3></tr>' +
                        '<tr><p>Estás recibiendo este email porque encontramos algunos resultados relevantes para tu búsqueda...</p></tr>' +
                        deeplinks +
                    '</table>' +
                '</div>' +
            '</div>' +
        '</body>';

    return emailHtml;
}


module.exports = router;
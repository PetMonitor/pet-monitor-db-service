const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer');
const logger = require('./logger.js');


const SOURCE_EMAIL_ADDRESS = process.env.SOURCE_EMAIL_ADDRESS || 'petmonitor@fi.uba.ar';
const SOURCE_EMAIL_CREDENTIALS = process.env.SOURCE_EMAIL_CREDENTIALS || 'password';
const SOURCE_EMAIL_HOST = process.env.SOURCE_EMAIL_HOST || 'smtp.gmail.com';
const SOURCE_EMAIL_PORT = process.env.SOURCE_EMAIL_PORT || 465;


const emailCredentials = {
    port: SOURCE_EMAIL_PORT, // true for 465, false for other ports              
    host: SOURCE_EMAIL_HOST,
        auth: {
            user: SOURCE_EMAIL_ADDRESS,
            pass: SOURCE_EMAIL_CREDENTIALS,
        },
    secure: true,
}


const transporter = nodemailer.createTransport(emailCredentials);


async function sendEmail(emailAddress, emailSubject, emailTemplatePath, variables={}, additionalAttachments=[]) {

    var emailTemplateHtml = fs.readFileSync(path.resolve(__dirname, emailTemplatePath), 'utf8');

    var replacements = "{{" + Object.keys(variables).join("}}|{{") + "}}";
    var re = new RegExp(replacements, "gi");

    emailTemplateHtml = emailTemplateHtml.replace(re, function (matchedString) {
        varName = matchedString.replace("{{","").replace("}}","")
        return variables[ varName ];
    })

    //logger.debug(`Replaced variables ${emailTemplateHtml}`)

    const mailData = {
        from: SOURCE_EMAIL_ADDRESS,  // sender address
        to: emailAddress,   // list of receivers
        subject: emailSubject,
        html: emailTemplateHtml,
        attachments: [
            ...additionalAttachments,
            {
                filename: 'complete_logo.png',
                path: path.resolve(__dirname,__dirname,'../assets/complete_logo.png'),
                cid: 'logo' 
            }
        ]
    }


    await transporter.sendMail(mailData, function (err, info) {
        if(err) {
            console.error(`Error sending email with subject ${mailData.subject} to address ${mailData.to}: ${err}`);
            throw new Error(err);
        } 
        console.log(info);
    });
}

async function sendEmailRawHtml(emailAddress, emailSubject, emailTemplatRawHtml) {
    logger.debug(`Sending raw html ${emailTemplatRawHtml}`)

    const mailData = {
        from: SOURCE_EMAIL_ADDRESS,  // sender address
        to: emailAddress,   // list of receivers
        subject: emailSubject,
        html: emailTemplatRawHtml,
        attachments: [{
            filename: 'complete_logo.png',
            path: path.resolve(__dirname,__dirname,'../assets/complete_logo.png'),
            cid: 'logo' 
        }]
    }

    await transporter.sendMail(mailData, function (err, info) {
        if(err) {
            console.error(`Error sending email with subject ${mailData.subject} to address ${mailData.to}: ${err}`);
            throw new Error(err);
        } 
        console.log(info);
    });
}



module.exports = {
	sendEmail: sendEmail,
    sendEmailRawHtml: sendEmailRawHtml,
}
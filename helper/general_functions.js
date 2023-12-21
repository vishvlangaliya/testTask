const config = require('../config/config.json');

const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const handlebars = require("handlebars");

/* OAuth2 config */
const { google } = require('googleapis')
const OAuth2_client = new google.auth.OAuth2(process.env.CLIENTID, process.env.CLIENTSECRET);
OAuth2_client.setCredentials({
    refresh_token: process.env.REFRESHTOKEN
})
/* OAuth2 config */

const generateJWTToken = async (payload) => {
    return jwt.sign({ email: payload.email, user_id: payload._id }, config.secret_key, { expiresIn: "12h" });
}

const sendMail = async (mail) => {
    try {
        const accessToken = await OAuth2_client.getAccessToken();
        const transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.NODEMAILER_USER,
                clientId: process.env.CLIENTID,
                clientSecret: process.env.CLIENTSECRET,
                refreshToken: process.env.REFRESHTOKEN,
                accessToken: accessToken
            }
        });
        const html = fs.readFileSync(path.join(__dirname, `../view/${mail.mail_file}`), 'utf8');
        const template = handlebars.compile(html)(mail.data);
        const mailOptions = {
            from: '"noreply@test.com "<noreply@test.com>',
            to: mail.to,
            cc: mail.cc || [],
            subject: mail.subject,
            html: template,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) { console.log(error); }
        });
    }
    catch (error) { console.error(error); }
}

const generatePassword = async (count) => {
    let chars = "0123456789ABCDEFGHIJqrstuvwxyz";
    let randomstring = '';
    for (let i = 0; i < count; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring
}

module.exports = {
    generateJWTToken: generateJWTToken,
    sendMail: sendMail,
    generatePassword: generatePassword
}
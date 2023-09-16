const nodemailer = require("nodemailer");
const senderEmail = process.env.EMAIL;
const pass = process.env.APP_PASSWORD;
const { MESSAGES } = require("../config/constant.config");
const path = require('path')


Mailer = (replacedHtml, email) => {
    const transporter = nodemailer.createTransport({
        service: "yahoo",
        auth: {
            user: senderEmail,
            pass: pass,
        },
    });

    // setup e-mail data with unicode symbols


    const mailOptions = {
        from: senderEmail,
        to: email,
        subject: "Reset Password",
        html: replacedHtml
    };

    // Sending the email
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(501).send({
                message: MESSAGES.USER.EMAIL_UNSENT + error,
                success: false,
            });
        }
    });
}

module.exports = Mailer
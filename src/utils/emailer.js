const nodemailer = require("nodemailer");
const senderEmail = process.env.EMAIL;
const pass = process.env.APP_PASSWORD;
const { MESSAGES } = require("../config/constant.config");
const path = require('path')


Mailer = async (subject, template, email) => {
    try {
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
            subject: subject,
            html: template
        };

        // Sending the email
        try {
            await transporter.sendMail(mailOptions);
            // Email sent successfully
        } catch (error) {
            console.error(error);
            throw new Error(MESSAGES.USER.EMAIL_UNSENT + error);
        }

    } catch (error) {
        console.error(error);
        throw new Error(MESSAGES.USER.EMAIL_UNSENT + error);
    }
}

module.exports = Mailer
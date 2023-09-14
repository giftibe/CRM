const nodemailer = require("nodemailer");
const senderEmail = process.env.EMAIL;
const pass = process.env.APP_PASSWORD;
const { MESSAGES } = require("../config/constant.config");



Mailer = (link, email) => {
    const transporter = nodemailer.createTransport({
        service: "yahoo",
        auth: {
            user: senderEmail,
            pass: pass,
        },
    });

    // Composed the email message
    const mailOptions = {
        from: senderEmail,
        to: email,
        subject: "Reset Password",
        html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Password Reset</title>
                    </head>
                    <body>
                        <p>Hello,</p>
                        <p>You've requested to reset your password. Click the link below to reset it:</p>
                        <a href="${link}">Reset Password</a>
                    </body>
                    </html>
                    `,
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
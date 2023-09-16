// Import necessary modules and dependencies
const checkValidId = require("../utils/validateID");
const { MESSAGES } = require("../config/constant.config");
const usersServices = require("../service/user.service");
const mailer = require("../utils/emailer");
const cloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const senderEmail = process.env.EMAIL;
const pass = process.env.APP_PASSWORD;
const fs = require('fs');
const path = require('path')


// Destructure service functions from usersServices
const {
    createUser,
    getAUserById,
    deleteUser,
    updateUser,
    getAllUsers,
    getAUserByEmail,
} = usersServices;

class userControllers {
    async signUp(req, res) {
        try {
            const { password, email } = req.body;

            //  Check if the email is provided
            if (!email) {
                return res.status(400).send({
                    message: MESSAGES.USER.ENTER_EMAIL,
                    success: false,
                });
            }

            if (!password) {
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                });
            }

            //  Check if the email already exists
            const findUserEmail = await getAUserByEmail({ email: email });
            if (findUserEmail) {
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.DUPLICATE_EMAIL,
                });
            }

            const secret = process.env.SECRET_KEY;
            //  Generate a unique verification token (JWT)
            const verificationToken = jwt.sign({ email }, secret, {
                expiresIn: "20m", // You can adjust the expiration time
            });

            //  Create a new user object with the provided data and the generated token
            const user = await createUser({ ...req.body, verificationToken });

            //  Send a verification email
            const verificationLink = `https://propell-ten.vercel.app/verify-email?token=${verificationToken}`;
            const transporter = nodemailer.createTransport({
                service: "yahoo",
                auth: {
                    user: senderEmail,
                    pass: pass,
                },
            });

            const mailOptions = {
                from: senderEmail,
                to: email,
                subject: "Verify Your Email",
                html: `
                <html>
                    <body>
                    <p>Hello,</p>
                    <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
                    </body>
                </html>
                `,
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return res.status(501).send({
                        message: MESSAGES.USER.EMAIL_UNSENT + error,
                        success: false,
                    });
                }
            });

            return res.status(201).send({
                message: MESSAGES.USER.CREATED,
                success: true,
            });
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + error,
                success: false,
            });
        }
    }

    async verifyEmail(req, res) {
        const { token } = req.query;

        try {
            const secret = process.env.SECRET_KEY;
            const decoded = jwt.verify(token, secret);

            if (!decoded) {
                return res.status(204).send({
                    message: MESSAGES.USER.EMAIL_VER_FAILED,
                    success: false,
                });
            }

            // Update the user's verification status to true
            await updateUserVerificationStatus(decoded.email, true);

            // welcome email

            const transporter = nodemailer.createTransport({
                service: "yahoo",
                auth: {
                    user: senderEmail,
                    pass: pass,
                },
            });

            const welcomeEmail = {
                from: senderEmail,
                to: decoded.email, // Use the user's email from the decoded token
                subject: "Welcome to Propell",
                html: `
            <html>
                <body>
                <p>Hello, Customer</p>
                <p>We are thrilled to welcome you to Propell.</p>
                <p>At Propell, we are committed to helping you build and maintain strong, lasting relationships with your customers. Propell is designed to streamline your processes,
                enhance customer interactions, and drive growth for your business.</p>
                </body>
            </html>
            `,
            };

            transporter.sendMail(welcomeEmail, (error) => {
                if (error) {
                    return res.status(501).send({
                        message: MESSAGES.USER.WELCOME_EMAIL_ERROR + error,
                        success: false,
                    });
                }
            });

            return res.status(200).send({
                message: MESSAGES.USER.EMAIL_VERIFIED,
                success: true,
            });
        } catch (error) {
            return res.status(403).send({
                message: MESSAGES.USER.INVALID_TOKEN,
                success: false,
            });
        }
    }

    //    @route   POST /api/v1/user/login
    //     @desc    Handles user login
    //     *  @access  Private

    async loginUser(req, res, next) {
        try {
            let { email } = req.body;
            const enteredPassword = req.body.password;
            let user = await getAUserByEmail({ email: email });

            if (!email) {
                return res.status(400).send({
                    message: MESSAGES.USER.ENTER_EMAIL,
                    success: false,
                });
            }

            if (!enteredPassword) {
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.W_PASSWORD,
                });
            }

            if (!user) {
                return res.status(404).send({
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                    success: false,
                });
            }

            // Check if the user is verified
            //   if (!user.isVerified) {
            //     return res.status(403).send({
            //       message: MESSAGES.USER.EMAIL_NOT_VERIFIED,
            //       success: false,
            //     });
            //   }

            const check = await bcrypt.compare(enteredPassword, user.password);
            if (!check) {
                return res.status(403).send({
                    message: MESSAGES.USER.W_PASSWORD,
                    success: false,
                });
            }

            const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
            const { password, ...data } = user.toJSON();

            return res.status(200).send({
                message: MESSAGES.USER.LOGGEDIN,
                success: true,
                user: data,
                token,
            });
        } catch (err) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + err,
                success: false,
            });
        }
    }

    //    @route   POST /api/v1/user/reset-password
    //     @desc    Sends reset password link via mail
    //     *  @access  Public

    async forgotPassword(req, res, next) {
        try {
            //check if the email exist in the database
            const { email } = req.body;
            const userEmail = await getAUserByEmail({ email: email });
            if (!userEmail) {
                return res.status(404).send({
                    message: MESSAGES.USER.EMAIL_NOTFOUND,
                    success: false,
                });
            }
            //if the email exists send
            const secret = process.env.SECRET_KEY;
            const payload = {
                email: userEmail.email,
                id: userEmail.id,
            };

            const token = jwt.sign(payload, secret, { expiresIn: "10m" });
            const link = `https://propell-ten.vercel.app/user/reset-password/${userEmail.id}/${token}`;

            //email sending
            const htmlFilePath = path.join(__dirname, "../client/password.html");
            const htmlFile = fs.readFileSync(htmlFilePath, 'utf8');
            const replacedHtml = htmlFile.replace('{{LINK}}', link);

            // using nodemailer to send the email
            const sendMail = mailer(replacedHtml, email);

            return res.status(401).send({
                success: false,
                message: MESSAGES.USER.EMAIL_SENT,
            });
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + error,
                success: false,
            });
        }
    }

    //      @route  GET /api/v1/user/reset-password/:id/:token
    //     @desc  Verifies link sent to the email checking the token and if the user exists using their ID
    //     *  @access  Unique

    async forgottenPassword(req, res, next) {
        try {
            const { id, token } = req.params;
            //check if a user with the id exist in db
            const checkUser = await getAUserById(id);
            if (!checkUser) {
                return res.status(401).send({
                    message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED,
                    success: false,
                });
            }

            try {
                const secret = process.env.SECRET_KEY;
                const decode = jwt.verify(token, secret);
                return res.status(200).send({
                    message: MESSAGES.USER.VALID_LINK,
                    success: true,
                });
            } catch (error) {
                return res.status(403).send({
                    message: MESSAGES.USER.INVALID_LINK + error,
                    success: false,
                });
            }
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + error,
                success: false,
            });
        }
    }

    //      @route  PATCH /api/v1/user/setpassword
    //     @desc    updates the password field
    //     *  @access  Private

    async updatePassword(req, res, next) {
        try {
            //check if  the email exist
            const { email, password } = req.body;
            const findUserEmail = await getAUserByEmail({ email: email });
            if (!findUserEmail) {
                return res.status(401).send({
                    message: MESSAGES.USER.EMAIL_NOTFOUND,
                    success: false,
                });
            }
            const { id } = findUserEmail;
            //generate new password and update it
            await updateUser(id, { password: password });
            return res.status(201).send({
                message: MESSAGES.USER.PASSWORD_UPDATED,
                success: false,
            });
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + error,
                success: false,
            });
        }
    }

    //    @route   POST /api/v1/user/logout
    //     @desc    Handles user logout
    //     *  @access  Private

    async loggedOut(req, res, next) {
        try {
            const token = "";
            await res.cookie("token", token, { httpOnly: true });
            return res.status(200).send({
                message: MESSAGES.USER.LOGGEDOUT,
                token: token,
                success: true,
            });
        } catch (err) {
            return res.status(500).send({
                message: MESSAGES.USER.SERVER_ERROR + err,
                success: false,
            });
        }
    }

    //    @route   DELETE /api/v1/user/:id
    //     @desc    Handles account deleting
    //     *  @access  Private

    async removeUser(req, res) {
        try {
            const { id } = req.params;
            // Check if the user exists
            const check = checkValidId(id);
            if (check) {
                const findUser = await getAUserById(id);
                if (findUser) {
                    const deleted = await deleteUser(id);
                    if (deleted) {
                        return res.status(200).send({
                            success: true,
                            message: MESSAGES.USER.ACCOUNT_DELETED,
                        });
                    } else {
                        return res.status(409).send({
                            success: false,
                            message: MESSAGES.USER.NOT_ACCOUNT_DELETED,
                        });
                    }
                } else {
                    return res.status(200).send({
                        success: false,
                        message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED,
                    });
                }
            } else {
                return res.status(409).send({
                    success: false,
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                });
            }
        } catch (err) {
            return res.status(500).send({
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            });
        }
    }

    //    @route   PATCH /api/v1/user/:id
    //     @desc   Updates a user
    //     *  @access  Private

    async updateAUser(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            // Check if valid id
            const check = checkValidId(id);
            if (check) {
                const findUser = await getAUserById(id);
                if (findUser) {
                    const updated = await updateUser(id, data);
                    if (updated) {
                        return res.status(200).send({
                            success: true,
                            message: MESSAGES.USER.ACCOUNT_UPDATED,
                            updated,
                        });
                    } else {
                        return res.status(409).send({
                            success: false,
                            message: MESSAGES.USER.NOT_UPDATED,
                        });
                    }
                } else {
                    return res.status(400).send({
                        success: false,
                        message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED,
                    });
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                });
            }
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            });
        }
    }

    //    @route   POST /api/v1/user/picture/:id
    //     @desc   upload a user picture
    //     *  @access  Private

    async uploadPhoto(req, res) {
        try {
            // calling the getAdminId function
            const id = req.params.id;
            const UserID = await getAUserById(id);
            if (!UserID) {
                return res.status(404).json({
                    message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED,
                    success: false,
                });
            }
            const file = req.file;

            // Implementing Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    file.path,
                    {
                        resource_type: "image",
                        folder: "images",
                    },
                    (error, result) => {
                        if (error) {
                            return reject({
                                message: MESSAGES.USER.PICTURE_NOT_UPLOADED + error,
                                success: false,
                            });
                        }
                        resolve(result);
                    }
                );
            });

            // updates the user account with the picture
            const photo = await updateUser(id, {
                cloudinary_id: uploadResult.public_id,
                url: uploadResult.url,
            });

            return res.status(200).json({
                success: true,
                message: MESSAGES.USER.PICTURE_UPLOADED,
                photo,
            });
        } catch (error) {
            return res.status(500).json({
                message: MESSAGES.USER.ERROR + error,
                success: false,
            });
        }
    }

    //    @route   GET /api/v1/user/:id
    //     @desc    Fetches a User
    //     *  @access  Private

    async findAUser(req, res) {
        try {
            const { id } = req.params;
            // Check if valid id
            const check = checkValidId(id);
            if (check) {
                const findUser = await getAUserById(id);
                if (findUser) {
                    return res.status(200).send({
                        success: true,
                        message: MESSAGES.USER.USER_FOUND,
                        data: findUser,
                    });
                }
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.USER_NOT_FOUND,
                });
            }
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            });
        }
    }

    //    @route   GET /api/v1/user/:id
    //     @desc    Fetches all User
    //     *  @access  Private

    async fetchAllUsers(req, res) {
        try {
            const getUsers = await getAllUsers();
            if (getUsers) {
                return res.status(200).send({
                    success: true,
                    message: MESSAGES.USER.USER_FOUND,
                    data: getUsers,
                });
            }
            return res.status(400).send({
                success: false,
                message: MESSAGES.USER.USER_NOT_FOUND,
            });
        } catch (error) {
            return res.status(500).send({
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            });
        }
    }
}

module.exports = new userControllers();

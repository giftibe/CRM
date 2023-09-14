// Import necessary modules and dependencies
const checkValidId = require("../utils/validateID");
const { MESSAGES } = require("../config/constant.config");
const usersServices = require("../service/user.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const senderEmail = process.env.EMAIL;
const pass = process.env.APP_PASSWORD;
const mailer = require("../utils/emailer")

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
                expiresIn: "5m", // You can adjust the expiration time
            });

            //  Create a new user object with the provided data and the generated token
            const user = await createUser({ ...req.body, verificationToken });

            //  Send a verification email
            const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
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

    //    @route   POST /api/v1/user/login
    //     @desc    Handles user login
    //     *  @access  Private
    
    async loginUser(req, res, next) {
        try {
            let { email } = req.body;
            const enteredPassord = req.body.password;
            let user = await getAUserByEmail({ email: email });
            if (!user) {
                return res.status(404).send({
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                    success: false,
                });
            }
            const check = await bcrypt.compare(enteredPassord, user.password);
            if (!check) {
                return res.status(403).send({
                    message: MESSAGES.USER.W_PASSWORD,
                    success: false,
                });
            }
            const token = jwt.sign(user.id, process.env.SECRET_KEY);
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
            const sendMail = mailer(link, email)

            return res.status(201).send({
                success: true,
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
                    message: MESSAGES.USER.INVALID_ID,
                });
            }
        } catch (err) {
            return {
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            };
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
                    const updated = await updateUser(id, req.body);
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
            return {
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            };
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
            return {
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            };
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
            return {
                message: MESSAGES.USER.ERROR + error.message,
                success: false,
            };
        }
    }
}

module.exports = new userControllers();

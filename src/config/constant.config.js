const MESSAGES = {
    DATABASE: {
        CONNECTED: "MongoDB is connected :)",
        ERROR: "An error occured while connecting to database "
    },

    USER: {
        CREATED: "User account created successfully",
        N_CREATED: "User account creation unsuccessfully",
        USER_FOUND: "Users found successfully",
        USER_NOT_FOUND: "User not found",
        ERROR: "An Error Occured ",
        ENTER_EMAIL: "Enter email address",
        DUPLICATE_EMAIL: "Email already exists",
        DUPLICATE_USERNAME: "Username already exists",
        REGISTERED: "Registration successful",
        EMAIL_NOTFOUND: 'Email not found',
        LOGGEDIN: 'Logged in successfully',
        W_PASSWORD: 'Wrong password',
        INCORRECT_DETAILS: 'Invalid credentials',
        ACCOUNT_NOT_REGISTERED: 'Account not registered',
        LOGGEDOUT: 'successfully loggedout',
        ACCOUNT_DELETED: 'Account deleted successfully',
        NOT_ACCOUNT_DELETED: 'Unable to delete user account',
        ACCOUNT_UPDATED: 'Account updated successfully',
        NOT_UPDATED: 'Account updated unsuccessful',
        UNAUTHORIZED: 'Unauthorized access ',
        SERVER_ERROR: 'Internal Server Error'
    }
}

module.exports = { MESSAGES }
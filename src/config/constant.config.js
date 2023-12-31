const ENUM = {
  COUNTRY: "",
  STATE: "",
  RESOURCES: "",
  FIRSTNAME: "",
  LASTNAME: "",
  IMAGE: "",
  MOBILE: 0,
};

const MESSAGES = {
  DATABASE: {
    CONNECTED: "MongoDB is connected :)",
    ERROR: "An error occured while connecting to database ",
  },

  USER: {
    CREATED: "User account created successfully",
    N_CREATED: "User account creation unsuccessfully",
    USER_FOUND: "Users found successfully",
    USER_NOT_FOUND: "User not found",
    ERROR: "An Error occured ",
    ENTER_EMAIL: "Enter email address",
    DUPLICATE_EMAIL: "Email already exists",
    DUPLICATE_USERNAME: "Username already exists",
    REGISTERED: "Registration successful",
    EMAIL_NOTFOUND: "Email not found",
    LOGGEDIN: "Logged in successfully",
    W_PASSWORD: "Wrong password",
    INCORRECT_DETAILS: "Invalid credentials",
    ACCOUNT_NOT_REGISTERED: "Account not registered",
    LOGGEDOUT: "successfully loggedout",
    ACCOUNT_DELETED: "Account deleted successfully",
    NOT_ACCOUNT_DELETED: "Unable to delete user account",
    ACCOUNT_UPDATED: "Account updated successfully",
    PASSWORD_UPDATED: "Password updated successfully",
    NOT_UPDATED: "Account updated unsuccessful",
    UNAUTHORIZED: "Unauthorized access ",
    SERVER_ERROR: "Internal Server Error",
    EMAIL_SENT: "Reset link has been sent to your email",
    EMAIL_UNSENT: "Reset link not sent",
    VALID_LINK: "Link is valid proceed to re-routing to change password",
    INVALID_LINK: "Link is invalid or has expired",
    EMAIL_VER_FAILED: "Email verification failed.",
    EMAIL_VERIFIED: "Email verified successfully.",
    WELCOME_EMAIL_ERROR: "error sending welcome email",
    INVALID_TOKEN: "Invalid or expired verification token.",
    NOT_VERIFIED: "user is not verified.",
    EMAIL_NOT_VERIFIED:
      "Email not verified. Please check your email for a verification link.",
    PICTURE_UPLOADED: "Picture uploaded successfully",
    PICTURE_NOT_UPLOADED: "Picture not uploaded",
  },
};

module.exports = { MESSAGES, ENUM };

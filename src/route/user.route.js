const { Router } = require("express");
const userRouter = Router();
const storage = require('../utils/multer')
const {
  validate_Account_Creation_Inputs,
  validate_User_Login_Inputs,
  validate_User_Update
} = (validate = require('../middleware/joi.validations'))


const {
  signUp,
  loginUser,
  findAUser,
  fetchAllUsers,
  updateAUser,
  removeUser,
  loggedOut,
  forgotPassword,
  forgottenPassword,
  updatePassword,
  verifyEmail,
  uploadPhoto
} = (userController = require("../controller/user.controller"));
userRouter.get("/user/verifyMail/:token", verifyEmail);
userRouter.post("/user/register", validate_Account_Creation_Inputs, signUp);
userRouter.post("/user/login", validate_User_Login_Inputs, loginUser);
userRouter.post("/user/reset-password", forgotPassword);
userRouter.post('/user/picture/:id', storage.single('file'), uploadPhoto)
userRouter.post("/user/logout", loggedOut);
userRouter.get("/user", fetchAllUsers);
userRouter.get("/user/reset-password/:id/:token", forgottenPassword);
userRouter.get("/user/:id", findAUser);
userRouter.patch("/user/setpassword/:id", updatePassword);
userRouter.patch("/user/:id", validate_User_Update, updateAUser);
userRouter.delete("/user/:id", removeUser);

module.exports = userRouter;
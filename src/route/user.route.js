const { Router } = require("express");
const userRouter = Router();

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
  updatePassword
} = (userController = require("../controller/user.controller"));

userRouter.post("/user/register", signUp);
userRouter.post("/user/login", loginUser);
userRouter.post("/user/reset-password", forgotPassword);
userRouter.post("/user/logout", loggedOut);
userRouter.get("/user", fetchAllUsers);
userRouter.get("/user/reset-password/:id/:token", forgottenPassword);
userRouter.get("/user/:id", findAUser);
userRouter.patch("/user/:id", updateAUser);
userRouter.patch("/user/setpassword", updatePassword);
userRouter.delete("/user/:id", removeUser);

module.exports = userRouter;

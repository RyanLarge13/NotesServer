import express from "express";
import auth from "../auth/authenticate.js";
import UserController from "../controllers/userController.js";

const userRouter = express.Router();
const userController = new UserController();

userRouter.get("/data", auth, userController.getUserData);
userRouter.get("/seperated/data", auth, userController.getUserDataSeperated);
userRouter.post("/login", userController.loginUser);
userRouter.post("/signup", userController.signupUser);
userRouter.post("/forgotcreds", userController.forgotCreds);
userRouter.patch("/update", auth, userController.updateUser);
userRouter.patch("/update/password", auth, userController.updateUserPassword);
userRouter.delete("/delete", auth, userController.deleteUser);

export default userRouter;

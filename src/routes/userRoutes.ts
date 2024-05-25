import express from "express";
import {
  getUser,
  getUsers,
  login,
  signup,
  activateHash,
  reset_password,
  reset_password_confirm,
  signupWithGoogle,
  signinWithGoogle,
} from "../controllers/userController";
import { protect } from "../utils";

const userRouter = express.Router();

userRouter.route("/").get(protect, getUsers);

userRouter.route("/:id").get(protect, getUser);

userRouter.route("/login").post(login);

userRouter.route("/signup").post(signup);

userRouter.route("/activate/:hash").get(activateHash);

userRouter.route("/reset-password").post(reset_password);

userRouter.route("/reset-password-confirm").post(reset_password_confirm);

userRouter.route("/signUpWithGoogle").post(signupWithGoogle);

userRouter.route("/signInWithGoogle").post(signinWithGoogle)

export default userRouter;

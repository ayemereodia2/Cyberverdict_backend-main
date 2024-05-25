"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const utils_1 = require("../utils");
const userRouter = express_1.default.Router();
userRouter.route("/").get(utils_1.protect, userController_1.getUsers);
userRouter.route("/:id").get(utils_1.protect, userController_1.getUser);
userRouter.route("/login").post(userController_1.login);
userRouter.route("/signup").post(userController_1.signup);
userRouter.route("/activate/:hash").get(userController_1.activateHash);
userRouter.route("/reset-password").post(userController_1.reset_password);
userRouter.route("/reset-password-confirm").post(userController_1.reset_password_confirm);
userRouter.route("/signUpWithGoogle").post(userController_1.signupWithGoogle);
userRouter.route("/signInWithGoogle").post(userController_1.signinWithGoogle);
exports.default = userRouter;
//# sourceMappingURL=userRoutes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reset_password_confirm = exports.reset_password = exports.logout = exports.getUser = exports.getUsers = exports.activateHash = exports.login = exports.signup = exports.signinWithGoogle = exports.signupWithGoogle = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const utils_1 = require("../utils");
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const User_1 = __importDefault(require("../models/User"));
const PendingUser_1 = __importDefault(require("../models/PendingUser"));
const AccessHash_1 = __importDefault(require("../models/AccessHash"));
dotenv_1.default.config();
exports.signupWithGoogle = (0, express_async_handler_1.default)(async (req, res) => {
    const rUser = await User_1.default.find({ email: req.body.email });
    if (rUser.length) {
        return res.status(422).send("A user with this email already exists");
    }
    try {
        const newUser = new User_1.default({
            name: req.body.name,
            email: req.body.email,
        });
        await newUser.save();
        res.send({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token: (0, utils_1.generateToken)(newUser),
        });
        return res.status(200).send("Congrats, Your account has been activated");
    }
    catch (error) {
        return res.status(422).send(error);
    }
});
exports.signinWithGoogle = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            // User not found
            return res.status(422).json("User does not exist");
        }
        // Login successful
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: (0, utils_1.generateToken)(user),
        });
    }
    catch (error) {
        // Internal server error
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.signup = (0, express_async_handler_1.default)(async (req, res) => {
    const rUser = await User_1.default.find({ email: req.body.email });
    const pUser = await PendingUser_1.default.find({ email: req.body.email });
    try {
        if (pUser.length) {
            return res
                .status(422)
                .send("A message link has been sent to this email already,go click on the link to activate your account");
        }
        else if (rUser.length) {
            return res.status(422).send("A user with this email already exists");
        }
        const newUser = new PendingUser_1.default({
            name: req.body.name,
            email: req.body.email,
            password: bcryptjs_1.default.hashSync(req.body.password),
        });
        const user = await newUser.save();
        const hash = newUser._id;
        res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: (0, utils_1.generateToken)(user),
        });
        const message = {
            from: process.env.GOOGLE_USER,
            // to: toUser.email // in production uncomment this
            to: newUser.email,
            subject: "CyberVerdict Team - Activate your account",
            html: `
              <h3> Hello ${newUser.name} </h3>
              <p>Thank you for taking this step to register into this one of a kind advanced blog app</p>
              <p>To continue your registration process please follow this link: <a target="_" href="${process.env.DOMAIN}/authpage/preference?hashs=${hash}">Activate Account</a></p>
              <p>Cheers!!</p>
              <p>Cyberverdict Team</p>
            `,
        };
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_USER,
                pass: process.env.GOOGLE_PASSWORD,
            },
        });
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
        // await sendResetPasswordEmail({toUser: user.data, hash: hash.data._id})
        // return res.json({message: "Please check your email to reset the password"})
    }
    catch (error) {
        return res.status(422).send(error);
    }
});
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            // User not found
            return res.status(401).json({ message: "Invalid email or password" });
        }
        if (!bcryptjs_1.default.compareSync(req.body.password, user.password)) {
            // Incorrect password
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Login successful
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: (0, utils_1.generateToken)(user),
        });
    }
    catch (error) {
        // Internal server error
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.activateHash = (0, express_async_handler_1.default)(async (req, res) => {
    const hash = req.params.hash;
    try {
        const user = await PendingUser_1.default.find({ _id: hash });
        const mainUser = user[0];
        const newUser = new User_1.default({
            name: mainUser.name,
            email: mainUser.email,
            password: mainUser.password,
        });
        await newUser.save();
        await PendingUser_1.default.deleteOne({ _id: mainUser._id });
        // await user.remove()
        res.send({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token: (0, utils_1.generateToken)(newUser),
        });
        return res.status(200).send("Congrats, Your account has been activated");
    }
    catch {
        return res.status(422).send("User cannot be activated");
    }
});
exports.getUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await User_1.default.find();
    res.send(users);
});
exports.getUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    res.send(user);
});
exports.logout = (0, express_async_handler_1.default)(async (req, res) => {
    res.cookie("jwt", "loggedout", {
        expiresIn: 3000,
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
});
exports.reset_password = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(422).send("User doesn't exist");
        }
        const hasHash = await AccessHash_1.default.findOne({ userId: user._id });
        if (hasHash) {
            return res
                .status(422)
                .send("Email to reset password was already sent!");
        }
        const hash = new AccessHash_1.default({ userId: user._id });
        await hash.save();
        const message = {
            from: process.env.GOOGLE_USER,
            // to: toUser.email // in production uncomment this
            to: user.email,
            subject: "Your App - Reset Password",
            html: `
            <h3> Hi ${user.name} </h3>
            <p>You recently asked to reset your Cyberverdict password, To reset it click on the button below.</p>
            <p>If you didn't request this plese reply to this email quickly and let us know.</p>
            <a target="_" href="${process.env.DOMAIN}/authpage/resetpassword/?hash=${hash._id}">Reset Your Password</a>
          `,
        };
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_USER,
                pass: process.env.GOOGLE_PASSWORD,
            },
        });
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
        // await sendResetPasswordEmail({toUser: user.data, hash: hash.data._id})
        return res.json({
            message: "Please check your email to reset the password",
        });
    }
    catch (error) {
        return res.status(422).send("Oooops, Something went wrong!");
    }
});
exports.reset_password_confirm = (0, express_async_handler_1.default)(async (req, res) => {
    const { password, hash } = req.body;
    try {
        const aHash = await AccessHash_1.default.findOne({ _id: hash });
        if (!aHash) {
            return res.status(422).send("cannot reset the password");
        }
        const user = await User_1.default.findOneAndUpdate({ _id: aHash.userId }, { $set: { password: bcryptjs_1.default.hashSync(password) } }, { new: true } // Return the modified document
        );
        const removehash = await AccessHash_1.default.deleteOne({ _id: aHash._id });
        return res.json({
            message: "password has been changed successfully, you can now login again",
        });
    }
    catch (error) {
        return res.status(422).send("Ooooops, Something went wrong");
    }
});
// export const logout = expressAsyncHandler(async(req:any, res: any) => {
//   res.cookie("jwt", "loggedout", {
//     expiresIn: Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: "success" });
// })
//# sourceMappingURL=userController.js.map
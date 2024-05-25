import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../utils";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import User from "../models/User";
import PendingUser from "../models/PendingUser";
import { promisify } from "util";
import { Jwt } from "jsonwebtoken";
import AccessHash from "../models/AccessHash";

dotenv.config();

export const signupWithGoogle = expressAsyncHandler(
  async (req: any, res: any) => {
    const rUser = await User.find({ email: req.body.email });
    if (rUser.length) {
      return res.status(422).send("A user with this email already exists");
    }
    try {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
      });
      await newUser.save();

      res.send({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser),
      });
      return res.status(200).send("Congrats, Your account has been activated");
    } catch (error) {
      return res.status(422).send(error);
    }
  }
);

export const signinWithGoogle = expressAsyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // User not found
      return res.status(422).json("User does not exist");
    }

    // Login successful
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  } catch (error) {
    // Internal server error
    res.status(500).json({ message: "Internal server error" });
  }
})

export const signup = expressAsyncHandler(async (req: any, res: any) => {
  const rUser = await User.find({ email: req.body.email });
  const pUser = await PendingUser.find({ email: req.body.email });
  try {
    if (pUser.length) {
      return res
        .status(422)
        .send(
          "A message link has been sent to this email already,go click on the link to activate your account"
        );
    } else if (rUser.length) {
      return res.status(422).send("A user with this email already exists");
    }
    const newUser = new PendingUser({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    const hash = newUser._id;
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
    // await sendResetPasswordEmail({toUser: user.data, hash: hash.data._id})
    // return res.json({message: "Please check your email to reset the password"})
  } catch (error) {
    return res.status(422).send(error);
  }
});

export const login = expressAsyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // User not found
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      // Incorrect password
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Login successful
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  } catch (error) {
    // Internal server error
    res.status(500).json({ message: "Internal server error" });
  }
});

export const activateHash = expressAsyncHandler(async (req: any, res: any) => {
  const hash = req.params.hash;
  try {
    const user = await PendingUser.find({ _id: hash });
    const mainUser = user[0];
    const newUser = new User({
      name: mainUser.name,
      email: mainUser.email,
      password: mainUser.password,
    });
    await newUser.save();
    await PendingUser.deleteOne({ _id: mainUser._id });
    // await user.remove()
    res.send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser),
    });
    return res.status(200).send("Congrats, Your account has been activated");
  } catch {
    return res.status(422).send("User cannot be activated");
  }
});

export const getUsers = expressAsyncHandler(async (req: any, res: any) => {
  const users = await User.find();
  res.send(users);
});

export const getUser = expressAsyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

export const logout = expressAsyncHandler(async (req: any, res: any) => {
  res.cookie("jwt", "loggedout", {
    expiresIn: 3000,
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

export const reset_password = expressAsyncHandler(
  async (req: any, res: any) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(422).send("User doesn't exist");
      }
      const hasHash = await AccessHash.findOne({ userId: user._id });
      if (hasHash) {
        return res
          .status(422)
          .send("Email to reset password was already sent!");
      }
      const hash = new AccessHash({ userId: user._id });
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

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_USER,
          pass: process.env.GOOGLE_PASSWORD,
        },
      });

      transporter.sendMail(message, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
      // await sendResetPasswordEmail({toUser: user.data, hash: hash.data._id})
      return res.json({
        message: "Please check your email to reset the password",
      });
    } catch (error) {
      return res.status(422).send("Oooops, Something went wrong!");
    }
  }
);

export const reset_password_confirm = expressAsyncHandler(
  async (req: any, res: any) => {
    const { password, hash } = req.body;
    try {
      const aHash = await AccessHash.findOne({ _id: hash });
      if (!aHash) {
        return res.status(422).send("cannot reset the password");
      }
      const user = await User.findOneAndUpdate(
        { _id: aHash.userId },
        { $set: { password: bcrypt.hashSync(password) } },
        { new: true } // Return the modified document
      );
      const removehash = await AccessHash.deleteOne({ _id: aHash._id });
      return res.json({
        message:
          "password has been changed successfully, you can now login again",
      });
    } catch (error) {
      return res.status(422).send("Ooooops, Something went wrong");
    }
  }
);

// export const logout = expressAsyncHandler(async(req:any, res: any) => {
//   res.cookie("jwt", "loggedout", {
//     expiresIn: Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: "success" });
// })

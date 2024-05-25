import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";
const emailValidator = require("email-validator");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: { validator: emailValidator.validate },
    },
    password: { type: String, minlength: 8 },
    preference: {
      type: String,
      enum: ["personal", "work"],
      default: "personal",
    },
    userPoints: { type: Number, default: 0 },
    username: { type: String },
    birthday: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

export default User;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_findorcreate_1 = __importDefault(require("mongoose-findorcreate"));
const emailValidator = require("email-validator");
const userSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
userSchema.plugin(mongoose_findorcreate_1.default);
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map
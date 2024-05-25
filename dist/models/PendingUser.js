"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pendingUserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true }
}, {
    timestamps: true
});
const PendingUser = mongoose_1.default.model('PendingUser', pendingUserSchema);
exports.default = PendingUser;
//# sourceMappingURL=PendingUser.js.map
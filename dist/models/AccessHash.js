"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accessHashSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    expires: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
});
const AccessHash = mongoose_1.default.model('AccessHash', accessHashSchema);
exports.default = AccessHash;
//# sourceMappingURL=AccessHash.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SavedPostSchema = new mongoose_1.default.Schema({
    userId: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    postTitles: [{ type: String }],
});
const SavedPost = mongoose_1.default.model("SavedPost", SavedPostSchema);
exports.default = SavedPost;
//# sourceMappingURL=SavedPost.js.map
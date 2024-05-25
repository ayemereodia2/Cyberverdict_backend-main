"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SavedVideoSchema = new mongoose_1.default.Schema({
    userId: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    videoTitles: [{ type: String }],
});
const SavedVideo = mongoose_1.default.model("SavedVideo", SavedVideoSchema);
exports.default = SavedVideo;
//# sourceMappingURL=SavedVideo.js.map
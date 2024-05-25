"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const feedItemSchema = new mongoose_1.default.Schema({
    creator: { type: String },
    date: { type: String },
    title: { type: String },
    link: { type: String },
    pubDate: { type: String },
    content: { type: String },
    contentSnippet: { type: String },
    guid: { type: String },
    isoDate: { type: String },
    category: { type: String },
    image: { type: String },
    // ... other fields
});
const FeedPost = mongoose_1.default.model("FeedPost", feedItemSchema);
exports.default = FeedPost;
//# sourceMappingURL=FeedPost.js.map
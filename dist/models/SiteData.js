"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SiteSchema = new mongoose_1.default.Schema({
    title: { type: String },
    siteLink: { type: String },
    image: { type: String },
    description: { type: String },
    language: { type: String },
    feedUrl: { type: String },
    category: { type: String },
});
const Site = mongoose_1.default.model("Site", SiteSchema);
exports.default = Site;
//# sourceMappingURL=SiteData.js.map
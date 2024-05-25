"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feedsController_1 = require("../controllers/feedsController");
const feedRouter = express_1.default.Router();
feedRouter.route("/").get(feedsController_1.getRssData);
feedRouter.route("/videosData").get(feedsController_1.getRssVideosData);
feedRouter.route("/post/:title").get(feedsController_1.getSingleRssPost);
feedRouter.route("/video/:title").get(feedsController_1.getSingleRssVideo);
feedRouter.route("/relatedPosts/:category").get(feedsController_1.getRelatedRssPosts);
feedRouter.route("/relatedVideos/:category").get(feedsController_1.getRelatedRssVideos);
feedRouter.route("/siteDetails").get(feedsController_1.getFeedSiteDetails);
feedRouter.route("/getSitePosts/:title").get(feedsController_1.getSitePosts);
feedRouter.route("/test").get(feedsController_1.quickTesting);
feedRouter.route("/getSites/:category").get(feedsController_1.getSitesCategory);
feedRouter.route("/getAllPosts").get(feedsController_1.getAllPosts);
feedRouter.route("/savePost").post(feedsController_1.savePost);
feedRouter.route("/checkSavedPost").get(feedsController_1.checkPostSaved);
feedRouter.route("/saveVideo").post(feedsController_1.saveVideo);
feedRouter.route("/checkSavedVideo").get(feedsController_1.checkVideoSaved);
exports.default = feedRouter;
//# sourceMappingURL=feedsRoutes.js.map
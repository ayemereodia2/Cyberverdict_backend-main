import express from "express";
import {
  getRssData,
  getRssVideosData,
  getSingleRssPost,
  getSingleRssVideo,
  getRelatedRssPosts,
  getRelatedRssVideos,
  getFeedSiteDetails,
  quickTesting,
  getSitePosts,
  getSitesCategory,
  getAllPosts,
  savePost,
  checkPostSaved,
  saveVideo,
  checkVideoSaved
} from "../controllers/feedsController";

const feedRouter = express.Router();

feedRouter.route("/").get(getRssData);
feedRouter.route("/videosData").get(getRssVideosData);
feedRouter.route("/post/:title").get(getSingleRssPost);
feedRouter.route("/video/:title").get(getSingleRssVideo);
feedRouter.route("/relatedPosts/:category").get(getRelatedRssPosts);
feedRouter.route("/relatedVideos/:category").get(getRelatedRssVideos);
feedRouter.route("/siteDetails").get(getFeedSiteDetails);
feedRouter.route("/getSitePosts/:title").get(getSitePosts);
feedRouter.route("/test").get(quickTesting);
feedRouter.route("/getSites/:category").get(getSitesCategory)
feedRouter.route("/getAllPosts").get(getAllPosts)
feedRouter.route("/savePost").post(savePost)
feedRouter.route("/checkSavedPost").get(checkPostSaved)
feedRouter.route("/saveVideo").post(saveVideo)
feedRouter.route("/checkSavedVideo").get(checkVideoSaved)

export default feedRouter;

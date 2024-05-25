"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduledTasks = exports.checkVideoSaved = exports.checkPostSaved = exports.saveVideo = exports.savePost = exports.getSitesCategory = exports.getSitePosts = exports.getFeedSiteDetails = exports.quickTesting = exports.getRelatedRssVideos = exports.getAllPosts = exports.getRelatedRssPosts = exports.getSingleRssVideo = exports.getSingleRssPost = exports.getRssVideosData = exports.getRssData = void 0;
const feedData_1 = __importDefault(require("../data/feedData"));
const feedVideosData_1 = __importDefault(require("../data/feedVideosData"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const cheerio_1 = __importDefault(require("cheerio"));
const FeedPost_1 = __importDefault(require("../models/FeedPost"));
const FeedVideo_1 = __importDefault(require("../models/FeedVideo"));
const SavedPost_1 = __importDefault(require("../models/SavedPost"));
const SavedVideo_1 = __importDefault(require("../models/SavedVideo"));
const axios_1 = __importDefault(require("axios"));
const SiteData_1 = __importDefault(require("../models/SiteData"));
const node_cron_1 = __importDefault(require("node-cron"));
const parser = new rss_parser_1.default();
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
const fetchWebpageHtml = async (url) => {
    const response = await fetch(url);
    return await response.text();
};
// Define a function to scrape the image from HTML content
const scrapeImageFromHtml = (html) => {
    const $ = cheerio_1.default.load(html);
    // Add your logic to select the image element using jQuery-style selectors
    const scrapedImageSrc = $("img").attr("src");
    return scrapedImageSrc;
};
const fetchFeedWithTimeout = async (url, timeout) => {
    const responsePromise = fetch(url);
    try {
        const response = await Promise.race([
            responsePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
        ]);
        if (response instanceof Response) {
            return response.text();
        }
        else {
            throw new Error("Request timed out");
        }
    }
    catch (error) {
        throw new Error("Request timed out");
    }
};
const getRssFeeds = async () => {
    const data = [];
    for (const feedInfo of feedData_1.default) {
        const feedUrl = feedInfo.url;
        try {
            const feedXml = await fetchFeedWithTimeout(feedUrl, 120000);
            const parsedFeed = await parser.parseString(feedXml);
            const itemsWithCategory = await Promise.all(parsedFeed.items.map(async (item) => {
                const match = item.content.match(/<img.*?src="(.*?)".*?>/);
                const hasImage = match !== null;
                let scrappedImage;
                if (!hasImage) {
                    try {
                        const webpageHtml = await fetchWebpageHtml(item.link);
                        const scrapedImage = scrapeImageFromHtml(webpageHtml);
                        if (scrapedImage) {
                            scrappedImage = scrapedImage;
                        }
                    }
                    catch (error) {
                        console.error(`Error scraping image for ${item.link}:`, error);
                    }
                }
                const image = hasImage ? match[1] : scrappedImage;
                const filter = { title: item.title };
                const update = {
                    $set: {
                        creator: item.creator,
                        date: item.date,
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        content: item.content,
                        contentSnippet: item.contentSnippet,
                        guid: item.guid,
                        isoDate: item.isoDate,
                        category: feedInfo.category,
                        image: image,
                    },
                };
                const options = { upsert: true };
                const result = await FeedPost_1.default.updateOne(filter, update, options);
                return {
                    ...item,
                    category: feedInfo.category,
                    image: image,
                };
            }));
            data.push(...itemsWithCategory);
        }
        catch (error) {
            console.error(`Error fetching or parsing RSS feed from ${feedUrl}:`, error);
            continue;
        }
    }
    const shuffledData = shuffleArray(data);
    return shuffledData;
};
const getRssData = async (req, res) => {
    try {
        // const cachedData = cache.get("rssData");
        // if (cachedData) {
        //   console.log("Serving cached data");
        //   return res.json(cachedData);
        // }
        // cache.put("rssData", shuffledData, 60000);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // const totalCount = await FeedPost.countDocuments(); 
        const rssData = await FeedPost_1.default.find({}).skip((page - 1) * limit).limit(limit);
        const shuffledData = shuffleArray(rssData);
        return res.json(shuffledData);
    }
    catch (error) {
        return res.status(422).send(error);
    }
};
exports.getRssData = getRssData;
const getRssVideosFeeds = async () => {
    const videosData = [];
    for (const feedVideoInfo of feedVideosData_1.default) {
        const feedUrl = feedVideoInfo.url;
        try {
            const feedXml = await fetchFeedWithTimeout(feedUrl, 120000);
            const parsedFeed = await parser.parseString(feedXml);
            const itemsWithCategory = await Promise.all(parsedFeed.items.map(async (item) => {
                const match = item.content.match(/<img.*?src="(.*?)".*?>/);
                const iframeMatch = item.content.match(/src="(https:\/\/www\.youtube\.com\/embed\/.*?)"/);
                const imageMatch = item.content.match(/<a href="(https?:\/\/[^\s]+)">/);
                const hasImage = match !== null;
                let scrappedImage;
                if (!hasImage) {
                    return null;
                }
                const baseImageUrl = new URL(item.link).origin;
                const image = hasImage
                    ? new URL(match[1], baseImageUrl).href
                    : scrappedImage;
                let videoUrl;
                if (iframeMatch) {
                    videoUrl = iframeMatch[1];
                }
                else if (imageMatch) {
                    videoUrl = imageMatch[1];
                }
                else {
                    videoUrl = "https://example.com/default-video-url";
                }
                const filter = { title: item.title };
                const update = {
                    $set: {
                        creator: item.creator,
                        date: item.date,
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        content: item.content,
                        contentSnippet: item.contentSnippet,
                        guid: item.guid,
                        isoDate: item.isoDate,
                        category: feedVideoInfo.category,
                        image: image,
                        video: videoUrl,
                    },
                };
                const options = { upsert: true };
                const result = await FeedVideo_1.default.updateOne(filter, update, options);
                return {
                    ...item,
                    category: feedVideoInfo.category,
                    image: image,
                    video: videoUrl,
                };
            }));
            const validItems = itemsWithCategory.filter((item) => item !== null);
            videosData.push(...validItems);
        }
        catch (error) {
            console.error(`Error fetching or parsing RSS feed from ${feedUrl}`, error);
            continue;
        }
    }
    const shuffledData = shuffleArray(videosData);
    return shuffledData;
};
const getRssVideosData = async (req, res) => {
    try {
        // const cachedData = cache.get("rssVideosData");
        // if (cachedData) {
        //   console.log("Serving cached data");
        //   return res.json(cachedData);
        // }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const rssData = await FeedVideo_1.default.find({}).skip((page - 1) * limit).limit(limit);
        const shuffledData = shuffleArray(rssData);
        return res.json(shuffledData);
    }
    catch (error) {
        return res.status(422).send(error);
    }
};
exports.getRssVideosData = getRssVideosData;
const getSingleRssPost = async (req, res) => {
    try {
        const post = await FeedPost_1.default.findOne({ title: req.params.title });
        res.send(post);
    }
    catch (error) {
        res.status(404).send({ message: "Post not found" });
    }
};
exports.getSingleRssPost = getSingleRssPost;
const getSingleRssVideo = async (req, res) => {
    try {
        const video = await FeedVideo_1.default.findOne({ title: req.params.title });
        res.send(video);
    }
    catch (error) {
        res.status(404).send({ message: "Post not found" });
    }
};
exports.getSingleRssVideo = getSingleRssVideo;
const getRelatedRssPosts = async (req, res) => {
    const category = req.params.category;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const relatedPosts = await FeedPost_1.default.find({ category: category }).skip((page - 1) * limit).limit(limit);
        const shuffledPosts = shuffleArray(relatedPosts);
        res.json(shuffledPosts);
    }
    catch (error) {
        res.status(400).send("Error fetching posts");
    }
};
exports.getRelatedRssPosts = getRelatedRssPosts;
const getAllPosts = async (req, res) => {
    try {
        const getAllPosts = await FeedPost_1.default.find();
        const shufflePosts = shuffleArray(getAllPosts);
        res.json(shufflePosts);
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getAllPosts = getAllPosts;
const getRelatedRssVideos = async (req, res) => {
    const category = req.params.category;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const relatedVideos = await FeedVideo_1.default.find({ category: category }).skip((page - 1) * limit).limit(limit);
        const shuffledPosts = shuffleArray(relatedVideos);
        res.json(shuffledPosts);
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getRelatedRssVideos = getRelatedRssVideos;
const quickTesting = async (req, res) => {
    try {
        const feedXml = await axios_1.default.get("https://www.techrepublic.com/rssfeeds/articles/");
        const parsedFeed = await parser.parseString(feedXml.data);
        const webpageHtml = await fetchWebpageHtml(parsedFeed.link);
        const image = scrapeImageFromHtml(webpageHtml);
        // const $ = cheerio.load(parsedFeed.link);
        // const image = $('img').attr('src')
        console.log(image);
        console.log(parsedFeed.title);
        console.log(parsedFeed.description);
        console.log(parsedFeed.link);
        console.log(parsedFeed.language);
        res.json(parsedFeed);
    }
    catch (error) {
        console.error(`error: ${error.message}`);
    }
};
exports.quickTesting = quickTesting;
const getSiteDetails = async (feedUrl) => {
    try {
        // Fetch feed XML
        const feedXml = await axios_1.default.get(feedUrl);
        const parsedFeed = await parser.parseString(feedXml.data);
        const webpageHtml = await fetchWebpageHtml(parsedFeed.link);
        const scrappedImage = scrapeImageFromHtml(webpageHtml);
        // Extract site details
        const siteDetails = {
            siteLink: parsedFeed.link,
            category: parsedFeed.category,
            title: parsedFeed.title,
            description: parsedFeed.description,
            image: scrappedImage,
            language: parsedFeed.language,
            feedUrl: feedUrl,
        };
        return siteDetails;
    }
    catch (error) {
        console.error(`Error fetching or parsing RSS feed from ${feedUrl}:`, error);
        throw error;
    }
};
const getSiteDetailsForAllFeeds = async () => {
    const siteDetailsArray = [];
    const feedArray = [...feedData_1.default, ...feedVideosData_1.default];
    for (const feedInfo of feedArray) {
        try {
            const siteDetails = await getSiteDetails(feedInfo.url);
            const filter = { siteLink: siteDetails.siteLink };
            const update = {
                $set: {
                    title: siteDetails.title,
                    category: feedInfo.category,
                    image: siteDetails.image,
                    description: siteDetails.description,
                    language: siteDetails.language,
                    feedUrl: siteDetails.feedUrl,
                    siteLink: siteDetails.siteLink,
                },
            };
            const options = { upsert: true };
            const result = await SiteData_1.default.updateOne(filter, update, options);
            siteDetailsArray.push({
                ...siteDetails,
                category: feedInfo.category,
            });
        }
        catch (error) {
            console.error(`Error getting site details for ${feedInfo.url}:`, error);
        }
    }
    return siteDetailsArray;
};
const getFeedSiteDetails = async (req, res) => {
    try {
        // const cachedData = cache.get("rssSiteData")
        // if (cachedData) {
        //   console.log("serving cached data")
        //   return res.json(cachedData)
        // }
        const siteDetails = await SiteData_1.default.find();
        const shuffledSites = shuffleArray(siteDetails);
        // cache.put("rssSiteData", shuffledSites)
        res.json(shuffledSites);
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getFeedSiteDetails = getFeedSiteDetails;
const getSitePosts = async (req, res) => {
    const title = req.params.title;
    const sitePosts = [];
    try {
        const site = await SiteData_1.default.findOne({ title: title });
        const siteLink = site.siteLink;
        const feedPosts = await FeedPost_1.default.find();
        for (const feed of feedPosts) {
            if (feed.link.includes(siteLink)) {
                sitePosts.push(feed);
            }
        }
        res.json(sitePosts);
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getSitePosts = getSitePosts;
const getSitesCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const sites = await SiteData_1.default.find({ category: category });
        res.json(sites);
    }
    catch (error) {
        res.status(500).send({ message: "internal Server Error" });
    }
};
exports.getSitesCategory = getSitesCategory;
const savePost = async (req, res) => {
    const { title, userId } = req.body;
    try {
        const savePost = await SavedPost_1.default.findOne({ userId: userId });
        if (savePost) {
            const index = savePost.postTitles.indexOf(title);
            if (index !== -1) {
                // Remove the title from the array if it exists
                savePost.postTitles.splice(index, 1);
                await savePost.save();
                return res.status(200).json({
                    status: "success",
                    message: "Post unsaved successfully",
                });
            }
            else {
                savePost.postTitles.push(title);
                await savePost.save();
                return res.status(200).json({
                    status: "success",
                    message: "Post saved successfully",
                });
            }
        }
        const newSavedPost = new SavedPost_1.default({
            userId: userId,
            postTitles: [title],
        });
        await newSavedPost.save();
        return res.status(200).json({
            status: "success",
            message: "Post saved successfully",
        });
    }
    catch (error) {
        return res.status(401).send(error);
    }
};
exports.savePost = savePost;
const saveVideo = async (req, res) => {
    const { title, userId } = req.body;
    try {
        const saveVideo = await SavedVideo_1.default.findOne({ userId: userId });
        if (saveVideo) {
            const index = saveVideo.videoTitles.indexOf(title);
            if (index !== -1) {
                // Remove the title from the array if it exists
                saveVideo.videoTitles.splice(index, 1);
                await saveVideo.save();
                return res.status(200).json({
                    status: "success",
                    message: "Video unsaved successfully",
                });
            }
            else {
                saveVideo.videoTitles.push(title);
                await saveVideo.save();
                return res.status(200).json({
                    status: "success",
                    message: "Video saved successfully",
                });
            }
        }
        const newSavedVideo = new SavedVideo_1.default({
            userId: userId,
            videoTitles: [title],
        });
        await newSavedVideo.save();
        return res.status(200).json({
            status: "success",
            message: "Video saved successfully",
        });
    }
    catch (error) {
        return res.status(401).send(error);
    }
};
exports.saveVideo = saveVideo;
const checkPostSaved = async (req, res) => {
    const { title, userId } = req.query;
    try {
        const savePost = await SavedPost_1.default.findOne({ userId: userId });
        if (savePost) {
            const index = savePost.postTitles.indexOf(title);
            if (index !== -1) {
                console.log("true");
                return res.status(200).json({
                    status: "success",
                    message: "saved post",
                });
            }
            else {
                return res.status(200).json({
                    status: "success",
                    message: "unsaved post",
                });
            }
        }
        return res.status(200).json({
            status: "success",
            message: "unsaved post",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(401).send(error);
    }
};
exports.checkPostSaved = checkPostSaved;
const checkVideoSaved = async (req, res) => {
    const { title, userId } = req.query;
    try {
        const saveVideo = await SavedVideo_1.default.findOne({ userId: userId });
        if (saveVideo) {
            const index = saveVideo.videoTitles.indexOf(title);
            if (index !== -1) {
                console.log("true");
                return res.status(200).json({
                    status: "success",
                    message: "saved video",
                });
            }
            else {
                return res.status(200).json({
                    status: "success",
                    message: "unsaved video",
                });
            }
        }
        return res.status(200).json({
            status: "success",
            message: "unsaved video",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(401).send(error);
    }
};
exports.checkVideoSaved = checkVideoSaved;
const startScheduledTasks = () => {
    node_cron_1.default.schedule("0 0 */6 * * *", async () => {
        // Run your function here
        await getRssFeeds();
        await getRssVideosFeeds();
        await getSiteDetailsForAllFeeds();
    });
};
exports.startScheduledTasks = startScheduledTasks;
//# sourceMappingURL=feedsController.js.map
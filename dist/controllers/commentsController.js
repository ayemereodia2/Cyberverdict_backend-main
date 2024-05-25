"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentLikes = exports.addLike = exports.getPostComments = exports.addComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const addComment = async (req, res) => {
    const { name, comment, title } = req.body;
    try {
        const newComment = new Comment_1.default({
            name: name,
            comment: comment,
            title: title
        });
        const saveComment = await newComment.save();
        return res.json(saveComment);
    }
    catch (error) {
        return res.status(422).send(error);
    }
};
exports.addComment = addComment;
const getPostComments = async (req, res) => {
    const title = req.params.title;
    try {
        const postComments = await Comment_1.default.find({ title: title });
        return res.json(postComments);
    }
    catch (error) {
        return res.status(422).send(error);
    }
};
exports.getPostComments = getPostComments;
const addLike = async (req, res) => {
    try {
        const { commentId, userId } = req.body;
        // Find the comment by its ID
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json("Comment not found");
        }
        // Check if the user already liked the comment
        if (comment.likes.includes(userId)) {
            const indexOfUser = comment.likes.indexOf(userId);
            comment.likes.splice(indexOfUser, 1);
            await comment.save();
            return res.status(200).json(false);
        }
        // Add the user ID to the likes array
        comment.likes.push(userId);
        // Save the updated comment
        await comment.save();
        return res.status(200).json(true);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Internal server error");
    }
};
exports.addLike = addLike;
const getCommentLikes = async (req, res) => {
    const commentId = req.params.commentId;
    try {
        const comment = await Comment_1.default.findById(commentId);
        return res.json(comment.likes);
    }
    catch (error) {
        return res.status(422).send(error);
    }
};
exports.getCommentLikes = getCommentLikes;
//# sourceMappingURL=commentsController.js.map
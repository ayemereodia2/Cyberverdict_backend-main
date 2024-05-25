import express from 'express'
import { addComment, addLike, getCommentLikes, getPostComments } from '../controllers/commentsController';

const commentRouter = express.Router();

commentRouter.route("/addComment").post(addComment)
commentRouter.route("/getComments/:title").get(getPostComments)
commentRouter.route("/addLike").post(addLike)
commentRouter.route("/getCommentLikes/:commentId").get(getCommentLikes)

export default commentRouter
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentsController_1 = require("../controllers/commentsController");
const commentRouter = express_1.default.Router();
commentRouter.route("/addComment").post(commentsController_1.addComment);
commentRouter.route("/getComments/:title").get(commentsController_1.getPostComments);
commentRouter.route("/addLike").post(commentsController_1.addLike);
commentRouter.route("/getCommentLikes/:commentId").get(commentsController_1.getCommentLikes);
exports.default = commentRouter;
//# sourceMappingURL=commentsRoutes.js.map
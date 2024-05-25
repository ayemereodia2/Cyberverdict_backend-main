import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    name: { type: String },
    comment: { type: String },
    title: { type: String },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;

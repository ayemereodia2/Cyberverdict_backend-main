import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema({
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  postTitles: [{ type: String }],
});

const SavedPost = mongoose.model("SavedPost", SavedPostSchema);
export default SavedPost;

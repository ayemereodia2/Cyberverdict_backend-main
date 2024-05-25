import mongoose from "mongoose";

const SavedVideoSchema = new mongoose.Schema({
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  videoTitles: [{ type: String }],
});

const SavedVideo = mongoose.model("SavedVideo", SavedVideoSchema);
export default SavedVideo;

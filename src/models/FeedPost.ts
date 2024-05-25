import mongoose from "mongoose";

const feedItemSchema = new mongoose.Schema({
  creator: { type: String },
  date: { type: String },
  title: { type: String },
  link: { type: String },
  pubDate: { type: String },
  content: { type: String },
  contentSnippet: { type: String },
  guid: { type: String },
  isoDate: { type: String },
  category: { type: String },
  image: { type: String },
  // ... other fields
});

const FeedPost = mongoose.model("FeedPost", feedItemSchema);
export default FeedPost;

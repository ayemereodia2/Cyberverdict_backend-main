import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema({
  title: { type: String },
  siteLink: { type: String },
  image: { type: String },
  description: { type: String },
  language: { type: String },
  feedUrl: { type: String },
  category: { type: String },
});

const Site = mongoose.model("Site", SiteSchema);
export default Site;

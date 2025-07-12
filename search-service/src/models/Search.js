import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    postId: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

searchSchema.index({ content: "text" });
searchSchema.index({ createdAt: -1 });

const Search = mongoose.model("Search", searchSchema);
export default Search;

import mongoose from "mongoose";
import argon2 from "argon2";

const mediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
     
    },
    mimetype: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Media = mongoose.model("Media", mediaSchema);
export default Media;

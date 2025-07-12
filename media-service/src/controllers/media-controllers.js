import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import logger from "./../utils/logger.js";
import Media from "./../../models/Media.js";

export const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("Add a file to continue!");

      return res.status(400).json({
        message: "Add a file to continue!",
      });
    }

    const { originalname, mimetype } = req.file;
    const userId = req.user.userId;
    logger.info("Starting cloudnary file upload");

    const cloudinaryFileResult = await uploadMediaToCloudinary(req.file);

    logger.info(
      `Sucessfully uploaded file ${cloudinaryFileResult.public_id} to cloudinary`
    );

    const newmedia = new Media({
      publicId: cloudinaryFileResult.public_id,
      userId,
      originalname,
      mimetype,
      url: cloudinaryFileResult.secure_url,
    });
    await newmedia.save();

    res.status(201).json({
      message: "Successfully uploaded media",
      success: true,
      mediaId: newmedia._id,
      url: newmedia.url,
    });
  } catch (error) {
    logger.error("Uploading Media Error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// user login
export const getAllMedias = async (req, res) => {
  logger.info(`Fetching all medias... `);
  try {
  } catch (e) {
    logger.error("Fetching media error", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

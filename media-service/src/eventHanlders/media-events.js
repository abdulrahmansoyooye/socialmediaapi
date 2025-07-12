import Media from "../../models/Media.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const handlePostDelete = async (event) => {
  try {
    const { mediaIds, postId } = event;

    const mediaToDelete =await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(`Deleted media ${media._id} associated with post ${postId}`);
    }
    logger.info(`Processed deletion of media for post id ${postId}`);
  } catch (error) {
    logger.error("Error deleting in Databse and cloudinary", error);
  }
};

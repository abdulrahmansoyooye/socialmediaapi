import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";

cloudinary.config({
  cloud_name: "dykezrt5j",
  api_key: "883981441266499",
  api_secret: "G56irTrTHrg8lEShZhn-f1P8jtU",
});
export const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (err, result) => {
        if (err) {
          logger.error("Error while uploading media to cloudinary", err);
          reject(err);
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    logger.info(`Deleted media from cloudinary`);
    return result;
  } catch (error) {
    logger.error("Error deleting media from in cloudinary", error);
    throw error
  }
};


import logger from "../utils/logger.js";
import Search from './../models/Search.js';

export const handlePostDeleted = async (event) => {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    logger.info(`Search post deleted: ${event.postId}}`);
    
  } catch (error) {
    logger.error("Error deleting search", error);
  }
};

export const handlePostCreated = async (event) => {
  try {
   const newsearchPost = new Search({
      postId:event.postId,
      userId:event.userId,
      content:event.content,
      createdAt:event.createdAt
    })

    await newsearchPost.save();

    logger.info(`Search post created ${event.postId}`);
  } catch (error) {
    logger.error("Error creating search post", error);
  }
};

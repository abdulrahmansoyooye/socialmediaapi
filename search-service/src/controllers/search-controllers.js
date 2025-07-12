import Search from "../models/Search.js";
import logger from "./../utils/logger.js";

export const searchPostController = async (req, res) => {
  try {
    const { query } = req.query;

    const results = await Search.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    res.json(results);
  } catch (e) {
    logger.error("Fetching media error", e);
    return res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

import logger from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitmq.js";
import Post from "./../models/Posts.js";
import { validateCreatepost } from "./../utils/validation.js";
const invalidatePostCache = async (req, input) => {
  const cachekey = `post:${input}`;
  await req.redisClient.del(cachekey);
  const keys = await req.redisClient.keys(`posts:*`);

  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
};
export const createPost = async (req, res) => {
  logger.warn("Create post endpoint hit");
  try {
    const { error } = validateCreatepost(req.body);

    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newPost.save();
    publishEvent("post.created",{
      content:newPost.content.toString(),
      createdAt:newPost.createdAt,
      postId:newPost._id.toString(),
      userId:req.user.userId,
    })
    invalidatePostCache(req, newPost._id.toString());
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (err) {
    logger.error("Error creating post", err);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

export const getAllPosts = async (req, res) => {
  logger.warn("Get all post endpoint hit");

  try {
    const redis = req.redisClient;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * 10;

    const cachekey = `posts:${page}:${limit}`;

    const cachedPosts = await redis.get(cachekey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalPosts = await Post.countDocuments();
    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    };

    await redis.setex(cachekey, 300, JSON.stringify(result));

    res.json(result);
  } catch (err) {
    logger.error("Error creating post", err);
    res.status(500).json({
      success: false,
      message: "Error fetching all posts",
    });
  }
};

export const getPost = async (req, res) => {
  try {
    const id = req.params.id;

    const cachekey = `post:${id}`;
    const cachedPosts = await req.redisClient.get(cachekey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await req.redisClient.setex(cachekey, 300, JSON.stringify(post));
    return res.json(post);
  } catch (err) {
    logger.error("Error creating post", err);
    res.status(500).json({
      success: false,
      message: "Error fetching individual post",
    });
  }
};

export const deletePost = async (req,res) => {
  try {
    const id = req.params.id;


    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
   
    invalidatePostCache(req, post._id);
    publishEvent("post.deleted",{
      mediaIds:post.mediaIds,
      postId:post._id.toString(),
      userId:req.user.userId,
    })
    return res.status(200).json({
      message: "Post Deleted Successfully",
    });
  } catch (err) {
    logger.error("Error creating post", err);
    res.status(500).json({
      success: false,
      message: "Error fetching individual post",
    });
  }
};

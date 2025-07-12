import express from "express";
import cors from "cors";
import { Redis } from "ioredis";
import helmet from "helmet";
import { RedisStore } from "rate-limit-redis";
import postRoutes from "./routes/post-routes.js";
import logger from "./utils/logger.js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";
import errorHandler from './middleware/errorHandler.js';
import { connectToRabbitMQ } from "./utils/rabbitmq.js";
const app = express();

const PORT = process.env.PORT || 3002;
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("Conected to Mongodb"))
  .catch((e) => logger.error("Mongodb connection error", e));
//middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const rateLimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimitOptions);

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);
app.use(errorHandler);
async function StartServer(){
  
  try {
    await connectToRabbitMQ()
    app.listen(PORT, () => {
      logger.info(`Post service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}
StartServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, reason: ${reason}`);
});

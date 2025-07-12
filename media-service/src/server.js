import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Redis } from "ioredis";
import RedisStore from "rate-limit-redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import rateLimit from "express-rate-limit";
import router from "./routes/media-routes.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import errorHandler from "./middleware/errorHandler.js";
import { handlePostDelete } from "./eventHanlders/media-events.js";
const app = express();
dotenv.config();
const redisClient = new Redis(process.env.REDIS_URL);
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("Conected to Mongodb"))
  .catch((e) => logger.error("Mongodb connection error", e));

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 20,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// ip based rate limiting for sentisive endpoints
const sensititveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
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

// app.use("/api/auth/register", sensititveEndpointsLimiter);

app.use("/api/media", router);

app.use(errorHandler);

async function StartServer(){
  
  try {
    
    await connectToRabbitMQ()

    await consumeEvent("post.deleted",handlePostDelete)
    app.listen(PORT, () => {
      logger.info(`Media service is running on port ${PORT}`);
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

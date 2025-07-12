import express from "express";
import cors from "cors";
import { Redis } from "ioredis";
import helmet from "helmet";
import { RedisStore } from "rate-limit-redis";
import proxy from "express-http-proxy";
import logger from "./utils/logger.js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { validateToken } from "./middleware/authMiddleware.js";
const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();
const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(express.json());
app.use(helmet());

const rateLimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
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

const proxyOptions = {
  proxyReqPathResolver: (req, res) => {
    if (req.originalUrl.startsWith("/v1")) {
      return req.originalUrl.replace(/^\/v1/, "/api");
    }
    return req.originalUrl;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: err.message,
    });
    next(err);
  },
};

app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },

    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response from Identity Service: ${proxyRes.statusCode} - ${userReq.originalUrl} `
      );

      if (proxyRes.statusCode >= 400) {
        return JSON.stringify({
          success: false,
          message: "An error occured while processing the request",
          statusCode: proxyRes.statusCode,
          data: JSON.parse(proxyResData.toString()),
        });
      }
      return proxyResData;
    },
  })
);

app.use(
  "/v1/posts",
  validateToken,
  proxy(process.env.POST_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },

    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response from Post Service: ${proxyRes.statusCode} - ${userReq.originalUrl} `
      );

      if (proxyRes.statusCode >= 400) {
        return JSON.stringify({
          success: false,
          message: "An error occured while processing the request",
          statusCode: proxyRes.statusCode,
          data: JSON.parse(proxyResData.toString()),
        });
      }
      return proxyResData;
    },
  })
);

app.use(
  "/v1/media",
  validateToken,
  proxy(process.env.MEDIA_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
     
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }
 
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);
app.use(
  "/v1/search",
  validateToken,
  proxy(process.env.SEARCH_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },

    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response from Post Service: ${proxyRes.statusCode} - ${userReq.originalUrl} `
      );

      if (proxyRes.statusCode >= 400) {
        return JSON.stringify({
          success: false,
          message: "An error occured while processing the request",
          statusCode: proxyRes.statusCode,
          data: JSON.parse(proxyResData.toString()),
        });
      }
      return proxyResData;
    },
  })
);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(
    `Identity Service is running on port ${process.env.IDENTITY_URL}`
  );
  logger.info(`Post Service is running on port ${process.env.POST_URL}`);
  logger.info(`Media Service is running on port ${process.env.MEDIA_URL}`);
  logger.info(`Search Service is running on port ${process.env.SEARCH_URL}`);

});

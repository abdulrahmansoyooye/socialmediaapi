import winston from "winston";
const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);
const fileLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);
const logger = winston.createLogger({
  level: logLevel,
  format: fileLogFormat,
  defaultMeta:{service: "media-service"},
  transports:[
    new winston.transports.Console({
        format:consoleFormat
    }),
    new winston.transports.File({
        filename:"error.log",
        level:"error"
    }),
    new winston.transports.File({
        filename:"combined.log"
    })
  ]
});

export default logger

import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;
const EXCHANGE_NAME = "socialmedia_app";
export const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

   await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to rabbit mq");
    return channel;
  } catch (error) {
    logger.error("Error connecting to rabbit mq", error);
  }
};

export const publishEvent = async (routingkey, message) => {
  if (!channel) {
    await connectToRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingkey,
    Buffer.from(JSON.stringify(message))
  );

  logger.info(`Event published: ${routingkey}`);
};

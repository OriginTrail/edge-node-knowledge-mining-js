const { Queue } = require("bullmq");
const { BullMQOtel } = require("bullmq-otel");
const redis = require("ioredis");

const connection = new redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
  maxRetriesPerRequest: null,
});

const queueName = process.env.KNOWLEDGE_MINING_QUEUE;
const knowledgeMiningQueue = new Queue(queueName, {
  connection,
  telemetry: new BullMQOtel("knowledge-mining"),
});

console.log(`Connected to Knowledge Mining Queue: ${queueName}`);

module.exports = { knowledgeMiningQueue, connection };

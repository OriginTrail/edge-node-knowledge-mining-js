const { Queue } = require("bullmq");
const redis = require("ioredis");

const connection = new redis({
  maxRetriesPerRequest: null,
});

const queueName = process.env.KNOWLEDGE_MINING_QUEUE;
const knowledgeMiningQueue = new Queue(queueName, {
  connection,
});

console.log(`Connected to Knowledge Mining Queue: ${queueName}`);

module.exports = { knowledgeMiningQueue, connection };

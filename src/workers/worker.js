require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Worker } = require("bullmq");
const { BullMQOtel } = require("bullmq-otel");
const { connection } = require("../queues/queue");
const Logger = require("../services/logger");

//set concurrency
let concurrency = 20;
try {
  concurrency = parseInt(process.env.KNOWLEDGE_MINING_CONCURRENCY);
} catch (e) {
  console.error("KNOWLEDGE_MINING_CONCURRENCY variable must be a valid number");
}

//preload pipelines
const pipelines = {};
const pipelineFiles = fs.readdirSync(path.join(__dirname, "../pipelines"));
pipelineFiles.forEach((file) => {
  const pipelineId = path.basename(file, ".js");
  pipelines[pipelineId] = require(path.join(__dirname, "../pipelines", file));
});

const queueName = process.env.KNOWLEDGE_MINING_QUEUE;
const kaMiningWorker = new Worker(
  queueName,
  async (job) => {
    const logger = new Logger(job.id, true);

    const { pipelineId, file, fileFormat, userData } = job.data;

    logger.logInfo(`Processing job for pipeline: ${pipelineId}`);

    const pipeline = pipelines[pipelineId];

    if (!pipeline) {
      logger.logError(`Pipeline with ID ${pipelineId} not found.`);
      logger.flush();
      return {
        success: false,
        message: `Pipeline with ID ${pipelineId} not found.`,
        status: "not_found",
      };
    }

    try {
      const fileName = file.originalname;
      const filePath = file.path;
      const fileContent =
        fileFormat === "pdf"
          ? fs.readFileSync(filePath) // Read as Buffer for PDF
          : fs.readFileSync(filePath, "utf8");

      const result = await pipeline.exec({
        fileName,
        fileFormat,
        fileContent,
        ...userData,
        logger,
      });

      logger.logInfo(`Pipeline ${pipelineId} completed successfully`);
      logger.flush();

      return {
        success: true,
        message: "Job completed",
        status: "success",
        result,
      };
    } catch (error) {
      logger.logError(
        `Error executing pipeline: ${pipelineId}: ${JSON.stringify(error)}}`
      );
      logger.flush();

      return {
        success: false,
        message: `Pipeline ${pipelineId} failed during execution.`,
        status: "failed",
      };
    }
  },
  {
    connection,
    concurrency,
    telemetry: new BullMQOtel("knowledge-mining"),
  }
);

// kaMiningWorker.on("active", (job) => {
//   console.log(`Job ${job.id} is now active. Processing started.`);
// });

// kaMiningWorker.on("progress", (job, progress) => {
//   console.log(`Job ${job.id} progress: ${progress}%`);
// });

// kaMiningWorker.on("completed", async (job, result) => {
//   console.log(`Job ${job.id} completed successfully! Result:`, result);
// });

// kaMiningWorker.on("failed", (job, err) => {
//   console.error(`Job ${job?.id || "unknown"} failed:`, err);
// });

// kaMiningWorker.on("stalled", (job) => {
//   console.warn(`Job ${job.id} stalled and will be retried.`);
// });

kaMiningWorker.on("error", (err) => {
  console.error("Worker encountered an error:", err);
});

kaMiningWorker.on("drained", () => {
  console.log("Worker queue has been drained, all jobs processed.");
});

kaMiningWorker.on("paused", () => {
  console.warn("Worker is paused.");
});

kaMiningWorker.on("resumed", () => {
  console.log("Worker has resumed processing jobs.");
});

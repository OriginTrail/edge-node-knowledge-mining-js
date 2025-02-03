const { knowledgeMiningQueue } = require("../queues/queue");

const addJobToQueue = async (pipelineId, file, fileFormat, userData) => {
  const job = await knowledgeMiningQueue.add(pipelineId, {
    pipelineId,
    file,
    fileFormat,
    userData,
  });
  console.log(`Added job to queue: ${job.id}`);

  return job;
};

const getJobStatus = async (jobName, jobId) => {
  const job = await knowledgeMiningQueue.getJob(jobId);
  if (job === null) {
    console.log("No job found with id " + jobId);
  }
  const status = await job.getState();

  console.log(`Retrieved job status ${status} for job ${jobName}:${jobId}`);

  return {
    id: job.id,
    status,
    result: job.returnvalue,
  };
};

module.exports = {
  addJobToQueue,
  getJobStatus,
};

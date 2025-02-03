const { addJobToQueue, getJobStatus } = require("../services/pipelineService");

const triggerPipeline = async (req, res) => {
  console.log(
    "Received request to trigger pipeline with data: ",
    req.file,
    req.body
  );

  const file = req.file;
  const { pipelineId, fileFormat } = req.body;

  if (!pipelineId) {
    return res.status(400).json({ error: "Missing pipelineId" });
  }
  if (!file) {
    return res.status(400).json({ error: "No selected file" });
  }

  try {
    const job = await addJobToQueue(pipelineId, file, fileFormat, req.userData);

    res.json({
      pipelineId,
      runId: job.id,
      message: "Pipeline triggered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error triggering pipeline:", error);
    res.status(500).json({ error: "Failed to trigger pipeline" });
  }
};

const getPipelineStatus = async (req, res) => {
  const { pipelineId, runId } = req.query;

  if (!pipelineId || !runId) {
    return res.status(400).json({ error: "Missing pipelineId or runId" });
  }

  try {
    const response = await getJobStatus(pipelineId, runId);

    if (!response) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json({ id: response.id, status: response.status, ...response.result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pipeline status" });
  }
};

module.exports = {
  triggerPipeline,
  getPipelineStatus,
};

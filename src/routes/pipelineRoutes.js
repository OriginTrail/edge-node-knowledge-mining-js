const express = require("express");
const multer = require("multer");
const {
  triggerPipeline,
  getPipelineStatus,
} = require("../controllers/pipelineController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

//TODO: uniform route naming
router.post(
  "/trigger-pipeline",
  authMiddleware,
  upload.single("file"),
  triggerPipeline
);
router.get("/check-pipeline-status", authMiddleware, getPipelineStatus);

module.exports = router;

const fs = require("fs");
const path = require("path");
const { LOG_LEVELS } = require("../utils/constants");

class Logger {
  constructor(jobId, saveToFile = false) {
    this.jobId = jobId;
    this.saveToFile = saveToFile;
    this.logEntries = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${this.jobId}] [${timestamp}] [${LOG_LEVELS[level]}] ${message}`;
    this.logEntries.push(logEntry);
  }

  logInfo(message) {
    this.log("INFO", message);
  }

  logWarning(message) {
    this.log("WARNING", message);
  }

  logError(message) {
    this.log("ERROR", message);
  }

  flush() {
    console.log(`\n=== Logs for Job ${this.jobId} ===`);
    this.logEntries.forEach((log) => console.log(log));
    console.log(`=== End of Logs for Job ${this.jobId} ===\n`);

    if (this.saveToFile) {
      const logsDir = path.join(__dirname, "../logs");
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      const filePath = path.join(
        logsDir,
        `job-${this.jobId}-${Date.now()}.log`
      );
      fs.writeFileSync(filePath, this.logEntries.join("\n"), "utf8");
    }
  }
}

module.exports = Logger;

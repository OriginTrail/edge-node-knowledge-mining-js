require("dotenv").config();
if (process.env.OTEL_ENABLED?.toLowerCase() === "true") {
  require("@opentelemetry/auto-instrumentations-node/register");
}
require("./src/queues/queue.js");
require("./src/workers/worker.js");

const express = require("express");
const pipelineRoutes = require("./src/routes/pipelineRoutes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5005;

const app = express();

const allowedOrigins = [
  "http://localhost:8100",
  "http://localhost:5173",
  process.env.UI_ENDPOINT,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.use(process.env.ROUTES_PREFIX || "/", pipelineRoutes);

const server = app.listen(port, () => {
  console.log(`Edge Node knowledge mining running on port ${port}`);
});

module.exports = app;

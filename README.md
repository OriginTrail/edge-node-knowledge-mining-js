# Edge Node Knowledge Mining

## Table of Contents
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Dependencies](#dependencies)

## Getting Started

Follow the instructions below to set up and run the project on your local machine.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v20 or higher)
- **Redis** (for BullMQ job queues)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OriginTrail/edge-node-knowledge-mining-js
   cd edge-node-knowledge-mining
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Make sure Redis is running on its default port (6379).

## Configuration

The project requires environment variables to be set. Use the provided `.env.example` file as a template:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Populate the `.env` file with the required values. Example:
   ```env
   PORT=5005
   UI_ENDPOINT=http://localhost:5173
   AUTH_SERVICE_ENDPOINT=http://localhost:3001

   KNOWLEDGE_MINING_QUEUE=knowledge-mining-queue
   KNOWLEDGE_MINING_CONCURRENCY=20

   OPENAI_API_KEY=your_openai_api_key
   UNSTRUCTURED_API_URL=your_unstructured_api_url
   UNSTRUCTURED_API_KEY=your_unstructured_api_key
   ```

## Usage

1. Start the service:
   ```bash
   npm start
   ```

2. The service will start on the configured port (default: `5005`).

## API Routes

### 1. **Trigger Pipeline**
   **POST** `/trigger-pipeline`

   This endpoint triggers a knowledge mining pipeline with a file upload.

   **Request:**
   - **Headers:**
     - `Authorization`: Bearer token for authentication.
   - **Body (form-data):**
     - `pipelineId` (string, required): The ID of the pipeline to trigger. ID is the filename of the file where the pipeline is defined (simple_json_to_jsonld, pdf_to_jsonld...).
     - `fileFormat` (string, optional): Format of the uploaded file (json, csv...).
     - `file` (file, required): File to be processed.

   **Example cURL:**
   ```bash
   curl -X POST http://localhost:5005/trigger-pipeline \
     -H "Authorization: Bearer <your_token>" \
     -F "pipelineId=12345" \
     -F "fileFormat=pdf" \
     -F "file=@example.pdf"
   ```

   **Response:**
   - **Success (200):**
     ```json
     {
       "pipelineId": "12345",
       "runId": "jobId123",
       "message": "Pipeline triggered successfully",
       "success": true
     }
     ```
   - **Error (400):**
     ```json
     { "error": "Missing pipelineId" }
     ```
     ```json
     { "error": "No selected file" }
     ```
   - **Error (500):**
     ```json
     { "error": "Failed to trigger pipeline" }
     ```

---

### 2. **Check Pipeline Status**
   **GET** `/check-pipeline-status`

   This endpoint retrieves the status of a specific pipeline run.

   **Request:**
   - **Headers:**
     - `Authorization`: Bearer token for authentication.
   - **Query Parameters:**
     - `pipelineId` (string, required): The ID of the pipeline.
     - `runId` (string, required): The ID of the specific run to check.

   **Example cURL:**
   ```bash
   curl -X GET "http://localhost:5005/check-pipeline-status?pipelineId=12345&runId=jobId123" \
     -H "Authorization: Bearer <your_token>"
   ```

   **Response:**
   - **Success (200):**
     ```json
     {
       "id": "jobId123",
       "status": "completed",
       "ka": <knowledge_asset_object>
     }
     ```
   - **Error (400):**
     ```json
     { "error": "Missing pipelineId or runId" }
     ```
   - **Error (404):**
     ```json
     { "error": "Pipeline not found" }
     ```
   - **Error (500):**
     ```json
     { "error": "Failed to fetch pipeline status" }
     ```

## Dependencies

The project uses the following dependencies:

- [Axios](https://www.npmjs.com/package/axios): HTTP client
- [BullMQ](https://www.npmjs.com/package/bullmq): Job queue library (requires Redis)
- [Cookie-parser](https://www.npmjs.com/package/cookie-parser): Parse HTTP cookies
- [CORS](https://www.npmjs.com/package/cors): Enable Cross-Origin Resource Sharing
- [Dotenv](https://www.npmjs.com/package/dotenv): Manage environment variables
- [Express](https://www.npmjs.com/package/express): Web framework for Node.js
- [ioredis](https://www.npmjs.com/package/ioredis): Redis client
- [JSON-LD](https://www.npmjs.com/package/jsonld): JSON-LD library
- [Multer](https://www.npmjs.com/package/multer): Middleware for handling `multipart/form-data`
- [OpenAI](https://www.npmjs.com/package/openai): OpenAI API client
- [Unstructured Client](https://www.npmjs.com/package/unstructured-client): Client for interacting with the Unstructured API

## OpenTelemetry

This service comes with OpenTelemetry support pre-installed. To enable it, set `OTEL_ENABLED=true` in .env variables.

OpenTelemetry is implemented using [@opentelemetry/auto-instrumentations-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node) package, and can be further configured using env variables.
- Configuration: https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
- Set up exporters: https://opentelemetry.io/docs/specs/otel/protocol/exporter/
- Exporters + dashboard docker setup: https://hub.docker.com/r/grafana/otel-lgtm 

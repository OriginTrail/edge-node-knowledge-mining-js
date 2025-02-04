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


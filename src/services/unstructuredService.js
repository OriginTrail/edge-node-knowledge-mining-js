const { UnstructuredClient } = require("unstructured-client");
const axios = require("axios");

let client;
let logger;

const initUnstructuredClient = (
  jobLogger,
  unstructuredApiUrl,
  unstructuredApiKey
) => {
  logger = jobLogger;
  let config;
  if (unstructuredApiUrl) {
    config = {
      serverURL: unstructuredApiUrl,
      //   server: "free-api",
    };
  }
  if (unstructuredApiKey) {
    config.security = {
      apiKeyAuth: unstructuredApiKey,
    };
  }

  client = new UnstructuredClient(config);
};

const unstructuredPartitioning = async (fileContent, fileName) => {
  logger.logInfo("Partitioning with Unstructured...");
  const response = await client.general.partition({
    partitionParameters: {
      files: {
        content: fileContent,
        fileName: fileName,
      },
      metadata_filename: "placeholder.pdf", // This param does nothing
      strategy: "hi_res",
      pdf_infer_table_structure: true,
      skip_infer_table_types: "[]",
      splitPdfPage: true,
      splitPdfAllowFailed: true,
      splitPdfConcurrencyLevel: 10,
    },
  });

  return JSON.parse(JSON.stringify(response.elements));
};

const unstructuredFiltering = (elements) => {
  logger.logInfo("Filtering with Unstructured...");
  return elements.filter((element) =>
    ["Title", "NarrativeText", "Table", "ListItem", "Image"].includes(
      element.type
    )
  );
};

const unstructuredCleaning = (elements) => {
  logger.logInfo("Cleaning with Unstructured...");
  return elements
    .map((item) => {
      let cleanedText = cleanExtraWhitespace(
        cleanBullets(item.text || item.metadata?.text_as_html || "")
      );
      if (cleanedText.length > 0) {
        item.text = cleanedText;
        return item;
      } else {
        logger.logInfo(
          `Removed item of type '${item.type}' due to empty text:`,
          item
        );
        return null;
      }
    })
    .filter((item) => item !== null);
};

const unstructuredConvertPdfToJsonArray = async (
  logger,
  fileContent,
  fileName,
  unstructuredApiUrl,
  unstructuredApiKey
) => {
  initUnstructuredClient(logger, unstructuredApiUrl, unstructuredApiKey);
  const partitionedElements = await unstructuredPartitioning(
    fileContent,
    fileName
  );
  const filteredElements = unstructuredFiltering(partitionedElements);
  const cleanedElements = unstructuredCleaning(filteredElements);
  return cleanedElements;
};

const cleanExtraWhitespace = (text) => {
  return text.replace(/\s+/g, " ").trim();
};

const cleanBullets = (text) => {
  return text.replace(/•/g, "").trim();
};

module.exports = {
  unstructuredConvertPdfToJsonArray,
};

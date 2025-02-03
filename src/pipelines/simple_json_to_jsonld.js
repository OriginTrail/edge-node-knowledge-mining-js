const { createChatCompletion } = require("../services/openaiService");
const { isValidJsonLd } = require("../services/jsonldService");

const convertToKA = async (data) => {
  const { logger } = data;
  logger.logInfo("Converting to Knowledge Asset...");

  const isValid = await isValidJsonLd(logger, data.fileContent);
  if (isValid) {
    logger.logInfo("File is already a valid JSON-LD file");
    return data.fileContent;
  } else {
    logger.logInfo("Transforming to JSON-LD file");

    const ka = {
      "@context": "http://schema.org",
      "@type": "DigitalDocument",
      name: data.fileName,
      fileFormat: "application/json",
      headline: "",
      abstract: "",
      contentType: "",
    };

    const prompt = `
      You are provided with a JSON object that represents a highly structured dataset. This object is rich in information, capturing various aspects related to a particular topic. Your task is to carefully analyze the contents of this JSON object and generate a detailed summary that conveys the essence of what the data represents.

      ** Instructions **:
      1. Read through the text content in the JSON object, considering all elements that contribute to the overall understanding of the topic.
      2. Craft a comprehensive narrative that encapsulates the core ideas, themes, and insights present in the dataset.
      3. The summary should not merely describe the structure of the JSON object (e.g., "It has property X and Y"), but rather tell a coherent story that a human reader can easily understand. Focus on delivering a clear, meaningful, and engaging summary of the information, as if you were explaining the key points to someone unfamiliar with the content.
      4. Capture as much information as you can from the JSON object for the abstract - it is totally alright that the abstract is long.
      5. Based on the content of the JSON object, determine the most appropriate content type (e.g., Dataset, Report, Article) that belongs to schema.org ontology, and return it as the third row. The content type should reflect the nature and purpose of the JSON content.

      ** Actual input **:
      Here is the text content from the JSON object for your analysis:
      ${JSON.stringify(data.fileContent)}

      ** Output format **:
      Make sure to answer in three rows:
      1. First row should be the headline.
      2. Second row should be the abstract - a detailed narrative that summarizes the content of the JSON object.
      3. Third row should be the inferred content type from schema.org (e.g., Dataset, Report, Article, Book, Movie).

      ** Example output **:
      Output 1:
      "Title of the Document (headline)
      This document provides a thorough exploration of... (abstract)
      Dataset"

      Output 2:
      "Key Findings on Topic X (headline)
      The dataset reveals critical insights into... (abstract)
      Report"
      `;

    logger.logInfo("Calling OpenAI API for text generation...");
    const responseText = await createChatCompletion(data.model, prompt);

    if (!responseText) {
      throw new Error("Failed to get response from OpenAI API");
    }

    logger.logInfo(`Received response: ${responseText}`);

    const responseLines = responseText.trim().split("\n");
    if (responseLines.length < 3) {
      throw new Error("Invalid response format from OpenAI API");
    }

    ka.headline = responseLines[0].trim();
    ka.abstract = responseLines[1].trim();
    ka.contentType = responseLines[2].trim().replace(/"/g, "");

    return ka;
  }
};

module.exports = {
  exec: convertToKA,
};

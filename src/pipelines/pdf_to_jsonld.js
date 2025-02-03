const {
  unstructuredConvertPdfToJsonArray,
} = require("../services/unstructuredService");
const { createChatCompletion } = require("../services/openaiService");
const { isValidJsonLd } = require("../services/jsonldService");

const convertToKA = async (data) => {
  const { logger } = data;

  const unstructuredApiUrl =
    data.unstructured_api_url || process.env.UNSTRUCTURED_API_URL;
  const unstructuredApiKey =
    data.unstructured_api_key || process.env.UNSTRUCTURED_API_KEY;

  if (data.fileFormat !== "pdf") {
    throw new Error("Only PDF files are supported for this pipeline");
  }

  const jsonArr = await unstructuredConvertPdfToJsonArray(
    logger,
    data.fileContent,
    data.fileName,
    unstructuredApiUrl,
    unstructuredApiKey
  );

  if (!jsonArr.length) {
    throw new Error("Unstructured returned empty response");
  }

  const ka = {
    "@context": "http://schema.org",
    "@type": "DigitalDocument",
    name: data.fileName,
    fileFormat: "application/pdf",
    headline: "",
    abstract: "",
    contentType: "",
    hasPart: [],
  };

  let fullText = "";
  jsonArr.forEach((chunk) => {
    fullText += (chunk.text || "") + " ";
  });

  // Chunk size 1000 with overlap 250
  const chunkSize = 1000;
  const overlap = 250;
  let start = 0;

  while (start < fullText.length) {
    const end = start + chunkSize;
    const textChunk = fullText.slice(start, end);

    const part = {
      text: textChunk,
    };

    ka["hasPart"].push(part);

    start += chunkSize - overlap;
  }

  const prompt = `
      You are given the first 200 elements of a JSON array, where each element represents a portion of a parsed PDF. Each element contains parsed text of the PDF.
      
      Your task is to analyze these elements to generate a headline and an abstract for the PDF. The headline should be a concise, descriptive title that encapsulates the main topic of the document. The abstract should be a brief summary, typically 3-5 sentences, that highlights the key points, findings, or themes of the PDF.
      
      ** Instructions **:
      Headline: Analyze the text fields across the 200 elements and identify the most relevant title or topic that represents the entire PDF.
      Abstract: Based on the text content in the elements, construct a brief abstract that summarizes the main points of the PDF.
      ContentType: Based on the content of the JSON object, determine the most appropriate content type (e.g., Dataset, Report, Article) that belongs to schema.org ontology, and return it as the third row. The content type should reflect the nature and purpose of the JSON content.
      
      ** Actual input **
      Here is the JSON array for you to analyze:
      ${jsonArr
        .slice(0, 200)
        .map((elem) => elem.text)
        .join("\n")}
      
      Make sure to answer in three rows:
      1. First row should be the headline.
      2. Second row should be the abstract - a detailed narrative that summarizes the content of the JSON object.
      3. Third row should be the inferred content type from schema.org (e.g., Dataset, Report, Article, Book, Movie).
      
      ** Output format **
      Make sure to answer in two rows - first row should be the headline and the second row should be the abstract.
      
      ** Example outputs **
      Output 1:
      "Here you will put the headline
      Here you will put the abstract
      Dataset"
      
      Output 2:
      "Headline 1 example
      Abstract 1 example
      Report"
      `;

  logger.logInfo(`Generating headline and abstract using ${data.model}`);

  const responseText = await createChatCompletion(data.model, prompt);
  const responseLines = responseText.split("\n");

  ka["headline"] = responseLines[0].trim();
  ka["abstract"] = responseLines[1].trim();
  ka["contentType"] = responseLines[2].trim().replace('"', "");

  return ka;
};

module.exports = {
  exec: convertToKA,
};

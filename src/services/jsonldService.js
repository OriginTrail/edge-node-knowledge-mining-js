const jsonld = require("jsonld");

const isValidJsonLd = async (logger, content) => {
  try {
    const data = JSON.parse(content);

    const normalizationOptions = {
      algorithm: "URDNA2015",
      format: "application/n-quads",
    };

    try {
      const nQuads = await jsonld.canonize(data, normalizationOptions);
      const assertion = nQuads
        .split("\n")
        .filter((quad) => quad.trim().length > 0);

      if (assertion.length === 0) {
        throw new Error("Invalid dataset, no quads were extracted.");
      }
    } catch (error) {
      logger.logWarning(`Remote context issue: ${error.message}`);

      if (data["@context"] && data["@type"]) {
        logger.logInfo("Fallback validation succeeded without normalization.");
        return true;
      } else {
        logger.logError(
          "Fallback validation failed: missing @context or @type."
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.logError(`Invalid JSON-LD content error: ${error.message}`);
    return false;
  }
};

module.exports = { isValidJsonLd };

const axios = require("axios");
const { transformUserData } = require("../utils/utils");

const baseUserData = {
  name: "John",
  endpoint: process.env.OT_NODE_HOSTNAME,
  blockchain: {
    name: "otp:2043",
  },
  vectorDBUri: process.env.VECTOR_DB_URI,
  vectorDBUsername: process.env.VECTOR_DB_USERNAME,
  vectorDBPassword: process.env.VECTOR_DB_PASSWORD,
  embeddingModelAPIKey: process.env.EMBEDDING_MODEL_API_KEY,
  embeddingModel: process.env.EMBEDDING_MODEL,
  provider: "openai",
  model: "gpt-4o-mini",
  apiKey: process.env.OPEN_AI_KEY,
  cohereKey: process.env.COHERE_KEY,
};

exports.authMiddleware = async (req, res, next) => {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        authenticated: false,
        message: "No session cookie found",
      });
    }

    const authResponse = await axios.get(
      `${process.env.AUTH_SERVICE_ENDPOINT}/auth/check`,
      {
        headers: {
          Cookie: sessionCookie,
        },
        withCredentials: true,
      }
    );

    if (authResponse.data.authenticated) {
      req.userData = {
        ...transformUserData(authResponse.data.user),
        ...baseUserData,
      };
      next();
    } else {
      return res.status(401).json({
        authenticated: false,
        message: "User not authenticated",
      });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res
      .status(500)
      .json({ authenticated: false, message: "Internal server error" });
  }
};

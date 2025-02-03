const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

const createChatCompletion = async (model, prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    throw new Error(`Error calling OpenAI API: ${JSON.stringify(error)}`);
  }
};

module.exports = {
  createChatCompletion,
};

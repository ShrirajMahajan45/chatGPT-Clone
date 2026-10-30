const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});


const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateResponse(content) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: content,
        config: {
          temperature: 0.3,
          systemInstruction: `
            You are an AI assistant.
            Answer accurately.
            If you don't know something, say so.
          `,
        },
      });

      return response.text;
    } catch (error) {
      const status = Number(error.status ?? error.code);

      const retryableStatuses = [
        408, 429, 500, 502, 503, 504,
      ];

      const shouldRetry =
        retryableStatuses.includes(status) &&
        attempt < maxAttempts;

      if (!shouldRetry) {
        console.error(
          `Gemini request failed after attempt ${attempt}:`,
          status,
          error.message
        );

        throw error;
      }

      // Retry after approximately 1 second, then 2 seconds.
      // Small random variation prevents synchronized retries.
      const delay =
        1000 * 2 ** (attempt - 1) +
        Math.floor(Math.random() * 300);

      console.warn(
        `Gemini returned ${status}. Retrying in ${delay}ms ` +
        `(attempt ${attempt + 1}/${maxAttempts}).`
      );

      await sleep(delay);
    }
  }
}


async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,

    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = { generateResponse, generateVector };

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(content) {
  // const interaction = await ai.interactions.create({
  //   model: "gemini-3.5-flash",
  //   input: content,
  // });
  // return interaction.output_text;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: content,
  });

  return response.text;
}

module.exports = { generateResponse };

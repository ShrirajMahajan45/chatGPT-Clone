const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(content) {
  // const interaction = await ai.interactions.create({
  //   model: "gemini-3.5-flash",
  //   input: content,
  // });
  // return interaction.output_text;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: content,
    config: {
      // temperature values lies between 0<= n <= 2, jitni jyada temp val utna creative res ai deto pn kadhi kadhi wrong ans pn deto
      temperature: 0.3,

      systemInstruction: `
      <role>
        You are an AI assistant.
      </role>

      <rules>
        <rule>Answer accurately.</rule>
        <rule>Keep answers short.</rule>
        <rule>If you don't know something, say so.</rule>
      </rules>
  `,
    },
  });

  return response.text;
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

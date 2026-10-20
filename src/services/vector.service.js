const { Pinecone } = require("@pinecone-database/pinecone");

// 1. Instantiate the client using the PINECONE_API_KEY environment variable
const pc = new Pinecone();

const cohortChatGptIndex = pc.Index("cohort-chat-gpt");

async function createMemory({ vectors, metadata, messageId }) {
  await cohortChatGptIndex.upsert({
    records: [
      {
        id: String(messageId),
        values: vectors,
        metadata: {
          chat: String(metadata.chat),
          user: String(metadata.user),
          text: String(metadata.text),
        },
      },
    ],
  });

  console.log("Memory successfully stored in Pinecone");
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  const data = await cohortChatGptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata
      ? {
          user: { $eq: String(metadata.user) },
        }
      : undefined,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = { createMemory, queryMemory };

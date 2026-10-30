
const { Pinecone } = require("@pinecone-database/pinecone");

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
      ? { user: { $eq: String(metadata.user) } }
      : undefined,
    includeMetadata: true,
  });

  return data.matches;
}

async function deleteMemoriesByIds(ids) {
  // Pinecone vector IDs are the corresponding MongoDB message IDs.
  const uniqueIds = [...new Set(ids.map(String))];

  // Delete in batches to handle chats with many messages.
  for (let i = 0; i < uniqueIds.length; i += 1000) {
    const batch = uniqueIds.slice(i, i + 1000);

    await cohortChatGptIndex.deleteMany({
      ids: batch,
    });
  }
}

module.exports = {
  createMemory,
  queryMemory,
  deleteMemoriesByIds,
};

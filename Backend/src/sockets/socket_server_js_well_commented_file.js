const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");

const aiService = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");

// ============================================================
// INITIALIZE SOCKET.IO SERVER
// ============================================================

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  // ==========================================================
  // STEP 1: AUTHENTICATE THE SOCKET CONNECTION
  // ==========================================================
  // This middleware runs before a client is allowed to connect.
  //
  // Flow:
  // 1. Read cookies from the socket handshake.
  // 2. Extract the JWT token.
  // 3. Verify the token using JWT_SECRET.
  // 4. Find the corresponding user in MongoDB.
  // 5. Attach the user to the socket for later use.
  // ==========================================================

  io.use(async (socket, next) => {
    const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "");

    // Reject the connection if no token is provided.
    if (!cookies.token) {
      next(new Error("Authentication error: No token provided"));
    }

    try {
      // Verify the JWT token and decode its payload.
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      // Retrieve the authenticated user from the database.
      const user = await userModel.findById(decoded.id);

      // Make the user available throughout this socket connection.
      socket.user = user;

      // Allow the socket connection to continue.
      next();
    } catch (error) {
      // Reject the connection if token verification or user lookup fails.
      next(new Error("Authentication error: No token provided"));
    }
  });

  // ==========================================================
  // STEP 2: HANDLE A NEW SOCKET CONNECTION
  // ==========================================================

  io.on("connection", (socket) => {
    // ========================================================
    // STEP 3: LISTEN FOR A USER'S AI MESSAGE
    // ========================================================
    // The client emits "ai-message" with the following payload:
    //
    // {
    //   chat: chatID,
    //   content: userMessage
    // }
    //
    // The server processes the message, retrieves relevant
    // memories, generates an AI response, and saves the result.
    // ========================================================

    socket.on("ai-message", async (messagePayload) => {
      // ======================================================
      // STEP 4: SAVE THE USER MESSAGE AND GENERATE ITS VECTOR
      // ======================================================
      // We need to:
      // 1. Save the user's message in MongoDB.
      // 2. Convert the message into a vector embedding.
      //
      // Promise.all() runs both independent operations concurrently
      // instead of waiting for one to finish before starting the other.
      // ======================================================

      const [message, vectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),

        aiService.generateVector(messagePayload.content),
      ]);

      // ======================================================
      // STEP 5: RETRIEVE LONG-TERM AND SHORT-TERM MEMORY
      // ======================================================
      // LONG-TERM MEMORY (LTM):
      // Search Pinecone for the three most relevant memories
      // belonging to the authenticated user.
      //
      // SHORT-TERM MEMORY (STM):
      // Retrieve the latest 20 messages from the current chat.
      //
      // Both operations are independent, so Promise.all()
      // executes them concurrently.
      // ======================================================

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        }),

        messageModel
          .find({ chat: messagePayload.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      // ======================================================
      // STEP 6: STORE THE USER MESSAGE IN LONG-TERM MEMORY
      // ======================================================
      // Save the message's vector embedding and metadata in
      // Pinecone so that it can be retrieved in future searches.
      //
      // Metadata includes:
      // - messageId: MongoDB message ID
      // - chat: chat ID
      // - user: authenticated user's ID
      // - text: original message content
      // ======================================================

      await createMemory({
        messageId: message._id,
        vectors,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      // ======================================================
      // STEP 7: FORMAT SHORT-TERM MEMORY FOR GEMINI
      // ======================================================
      // Convert MongoDB chat messages into the format expected
      // by the AI service.
      //
      // Each message contains:
      // - role: "user" or "model"
      // - parts: an array containing the message text
      // ======================================================

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      // ======================================================
      // STEP 8: FORMAT LONG-TERM MEMORY FOR GEMINI
      // ======================================================
      // Convert the retrieved Pinecone memories into a text
      // message containing the relevant previous conversations.
      //
      // memory.map() extracts the text from each result's metadata.
      // join("\n") separates the memories with newline characters.
      //
      // NOTE: This uses role: "user" as in your original code.
      // ======================================================

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `these are some previous messages from chat,use them to generate a response
                ${memory.map((item) => item.metadata.text).join("\n")}
                  `,
            },
          ],
        },
      ];

      // Log the formatted long-term and short-term memories.
      console.log(ltm, stm);

      // ======================================================
      // STEP 9: GENERATE THE AI RESPONSE
      // ======================================================
      // Send both types of memory to the AI service.
      //
      // Your original order is preserved:
      // 1. Long-term memory (ltm)
      // 2. Short-term memory (stm)
      //
      // The AI service generates a response using this context.
      // ======================================================

      const response = await aiService.generateResponse([...ltm, ...stm]);

      // ======================================================
      // STEP 10: SEND THE AI RESPONSE TO THE CLIENT
      // ======================================================
      // Emit "ai-response" to the same connected socket.
      //
      // The client receives:
      // {
      //   content: generatedResponse,
      //   chat: chatID
      // }
      // ======================================================

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      // ======================================================
      // STEP 11: SAVE THE AI RESPONSE AND GENERATE ITS VECTOR
      // ======================================================
      // Store the AI response in MongoDB and generate its vector
      // embedding concurrently, just as we did for the user message.
      // ======================================================

      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: response,
          role: "model",
        }),

        aiService.generateVector(response),
      ]);

      // ======================================================
      // STEP 12: STORE THE AI RESPONSE IN LONG-TERM MEMORY
      // ======================================================
      // Save the AI response's vector and metadata in Pinecone.
      // This allows the response to be considered in future
      // long-term memory searches.
      // ======================================================

      await createMemory({
        messageId: responseMessage._id,
        vectors: responseVectors,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });
    });
  });
}

// Export the function so it can be used by the main server file.
module.exports = initSocketServer;

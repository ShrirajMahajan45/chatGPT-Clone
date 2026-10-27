// In this file , GPT handle the all errors 
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const {
  createMemory,
  queryMemory,
} = require("../services/vector.service");

function initSocketServer(httpServer) {
  // 1. Configure Socket.IO CORS
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // 2. Authenticate the socket using the token cookie
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(
        socket.handshake.headers.cookie || ""
      );

      if (!cookies.token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        cookies.token,
        process.env.JWT_SECRET
      );

      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  // 3. Handle client connections
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user._id.toString());

    socket.on("ai-message", async (messagePayload) => {
      const chatId = messagePayload?.chat;
      const content = messagePayload?.content;

      // Validate the incoming message
      if (
        !chatId ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return socket.emit("ai-error", {
          chat: chatId,
          message: "Please provide a valid message.",
        });
      }

      try {
        const userId = socket.user._id;

        // 4. Save the user's message and generate its vector
        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            user: userId,
            chat: chatId,
            content: content.trim(),
            role: "user",
          }),
          aiService.generateVector(content.trim()),
        ]);

        // 5. Fetch relevant memory and chat history
        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { user: userId },
          }),

          messageModel
            .find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        // 6. Save the user's message in long-term memory
        await createMemory({
          messageId: userMessage._id,
          vectors,
          metadata: {
            chat: chatId,
            user: userId,
            text: content.trim(),
          },
        });

        // 7. Format history for the AI service
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `Relevant previous messages:\n${memory
                  .map((item) => item.metadata.text)
                  .join("\n")}`,
              },
            ],
          },
        ];

        // 8. Generate the AI response
        const response = await aiService.generateResponse([
          ...ltm,
          ...stm,
        ]);

        if (typeof response !== "string" || !response.trim()) {
          throw new Error("AI returned an empty response");
        }

        // 9. Generate vector and save the AI response
        const [responseVectors, responseMessage] = await Promise.all([
          aiService.generateVector(response),

          messageModel.create({
            user: userId,
            chat: chatId,
            content: response,
            role: "model",
          }),
        ]);

        // 10. Save the AI response in long-term memory
        await createMemory({
          messageId: responseMessage._id,
          vectors: responseVectors,
          metadata: {
            chat: chatId,
            user: userId,
            text: response,
          },
        });

        // 11. Send the completed response to the frontend
        socket.emit("ai-response", {
          content: response,
          chat: chatId,
        });
      } catch (error) {
        console.error("AI message error:", error);

        // Tell the frontend that something went wrong
        socket.emit("ai-error", {
          chat: chatId,
          message: "Failed to generate a response. Please try again.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user._id.toString());
    });
  });

  return io;
}

module.exports = initSocketServer;

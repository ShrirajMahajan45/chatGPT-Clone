const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  // middleware to check incomming req for socketIO connection to the server is from authenticated(Valid) user or not
  io.use(async (socket, next) => {
    const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: No token provided"));
    }
  });

  io.on("connection", (socket) => {
    // creating the ai-message socketEvent
    socket.on("ai-message", async (messagePayload) => {
      /* messagePayload:{chat: chatID, content: userMessage} */
      console.log(messagePayload);

      // store userMessage in DB
      const message = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user",
      });

      // converting the userMessage into vectors to store it in long term memory(vectorDB: pinecone)
      const vectors = await aiService.generateVector(messagePayload.content);

      // query/search the userMessage in vectorDb(pinconeDB), means finding anything related info to currUsermessage is available in vectorDB or not

      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metadata: {},
      });
      console.log("memory:", memory);

      // storing users messages in pineconeDB  longTermMemory Implementation
      await createMemory({
        messageId: message._id,
        vectors,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      // implementing the short term memory
      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      // const formatedChatHistories = chatHistory.map(item => {
      //   return {
      //     role: item.role,
      //     parts: [{ text: item.content }],
      //   };
      // });
      // console.log(formatedChatHistories);

      // passing user message to AI

      const response = await aiService.generateResponse(
        chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        }),
      );

      // store the ai response in DB
      const responseMessage = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: response,
        role: "model",
      });

      // converting the userMessage into vectors to store it in long term memory(vectorDB: pinecone)
      const responseVectors = await aiService.generateVector(response);

      // storing aiResponse in pineconeDB for longTermMemory Implementation
      await createMemory({
        messageId: responseMessage._id,
        vectors: responseVectors,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

      // sending res to user
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;

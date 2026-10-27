const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  // middleware to check incomming req for socketIO connection to the server is from authenticated(Valid) user or not
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parseCookie(
        socket.handshake.headers?.cookie || "",
      );

      if (!cookies.token) {
        next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Authentication error: No token provided"));
    }
  });

  io.on("connection", (socket) => {
    console.log("connected to socketIO Successfully");

    // creating the ai-message socketEvent
    socket.on("ai-message", async (messagePayload) => {
      /* messagePayload:{chat: chatID, content: userMessage} */
      // step 1:
      // console.log(messagePayload);

      /*
        // step 2: Store User Message in DB:
        const message = await messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        });

        // step 3: Convert User Message into Vectors: converting the userMessage into vectors to store it in long term memory(vectorDB: pinecone)
        const vectors = await aiService.generateVector(messagePayload.content);
    */

      // Optimizing step 2 and step 3: we can start step 2 and step 3 simulteneously

      const [message, vectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),
        aiService.generateVector(messagePayload.content),
      ]);

      /* 
        // step 4: Search Vector Database (PineconeDB): query/search the userMessage in vectorDb(pinconeDB), means finding anything related info to currUsermessage is available in vectorDB or not

        const memory = await queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        });
        console.log("memory:", memory);

        // step 6: Retrieve Chat History: implementing the short term memory
          const chatHistory = (
            await messageModel
              .find({
                chat: messagePayload.chat,
              })
              .sort({ createdAt: -1 })
              .limit(20)
              .lean()
          ).reverse();

      */

      // Optimizing step 4 and step 6: we can start step 4 and step 5 simulteneously

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

      // step 5: Store User Message in PineconeDB: storing users messages in pineconeDB  longTermMemory Implementation
      await createMemory({
        messageId: message._id,
        vectors,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      // step 7: Prepare STM and LTM:  creating the short term Memory in Gemini Format (we can refer Gemini Docs -> function calling section)
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      // creating the long term Memory  in Gemini Format (we can refer Gemini Docs -> function calling section)
      const ltm = [
        {
          // role = system means it is not a user nor model, we are using "system" so it tells that this are the previous conversations(it is used for long term memory)
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

      console.log(ltm, stm);

      // step 8: Generate AI Response:
      // passing user message to AI
      // always passed ltm first then passed stm
      const response = await aiService.generateResponse([...ltm, ...stm]);

      // step 9: Send AI Response to User: sending res to user
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      /* 
        // step 10: Store AI Response in DB: store the ai response in DB
        const responseMessage = await messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: response,
          role: "model",
        });

        // step 11: Convert AI Response into Vectors: converting the userMessage into vectors to store it in long term memory(vectorDB: pinecone)
        const responseVectors = await aiService.generateVector(response);

      */

      // Optimizing step 10 and step 11: we can start step 10 and step 11 simulteneously
      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: response,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);

      // step 12: Store AI Response Vector in PineconeDB: storing aiResponse in pineconeDB for longTermMemory Implementation
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

module.exports = initSocketServer;

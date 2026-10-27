const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function createChatController(req, res) {
  const { title } = req.body;
  user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chat Created Successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function getChatController(req, res) {
  user = req.user;

  const chats = await chatModel.find({
    user: user._id,
  });

  res.status(201).json({
    message: "Chat Retrived Successfully",
    chats: chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
}

async function getMessagesController(req, res) {
  const chatID = req.params.id;
  const messages = await messageModel
    .find({ chat: chatID })
    .sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages Retrived Successfully",
    messages: messages,
  });
}

module.exports = {
  createChatController,
  getChatController,
  getMessagesController,
};

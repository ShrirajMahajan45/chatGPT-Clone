const mongoose = require("mongoose");
const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const { deleteMemoriesByIds } = require("../services/vector.service");

async function createChatController(req, res) {
  try {
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!title) {
      return res.status(400).json({
        message: "Chat title is required.",
      });
    }

    const chat = await chatModel.create({
      user: req.user._id,
      title,
    });

    return res.status(201).json({
      message: "Chat created successfully.",
      chat: {
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user,
      },
    });
  } catch (error) {
    console.error("Create chat failed:", error);
    return res.status(500).json({ message: "Could not create chat." });
  }
}

async function getChatController(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Chats retrieved successfully.",
      chats: chats.map((chat) => ({
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user,
      })),
    });
  } catch (error) {
    console.error("Get chats failed:", error);
    return res.status(500).json({ message: "Could not load chats." });
  }
}

async function getMessagesController(req, res) {
  try {
    const chatID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(chatID)) {
      return res.status(400).json({ message: "Invalid chat ID." });
    }

    // Verify ownership before returning any messages.
    const chat = await chatModel.findOne({
      _id: chatID,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const messages = await messageModel
      .find({
        chat: chat._id,
        user: req.user._id,
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Messages retrieved successfully.",
      messages,
    });
  } catch (error) {
    console.error("Get messages failed:", error);
    return res.status(500).json({ message: "Could not load messages." });
  }
}

async function renameChatController(req, res) {
  try {
    const chatID = req.params.id;
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(chatID)) {
      return res.status(400).json({ message: "Invalid chat ID." });
    }

    if (!title || title.length > 100) {
      return res.status(400).json({
        message: "Title must contain between 1 and 100 characters.",
      });
    }

    const chat = await chatModel.findOneAndUpdate(
      {
        _id: chatID,
        user: req.user._id,
      },
      { $set: { title } },
      { new: true, runValidators: true },
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    return res.status(200).json({
      message: "Chat renamed successfully.",
      chat: {
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
      },
    });
  } catch (error) {
    console.error("Rename chat failed:", error);
    return res.status(500).json({ message: "Could not rename chat." });
  }
}

async function deleteChatController(req, res) {
  try {
    const chatID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(chatID)) {
      return res.status(400).json({ message: "Invalid chat ID." });
    }

    // Only the owner can delete this chat.
    const chat = await chatModel.findOne({
      _id: chatID,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const messages = await messageModel
      .find({ chat: chat._id, user: req.user._id })
      .select("_id")
      .lean();

    const messageIds = messages.map((message) => String(message._id));

    // Remove vector memories first. If Pinecone fails, preserve the
    // MongoDB chat and messages so deletion can safely be retried.
    await deleteMemoriesByIds(messageIds);

    await messageModel.deleteMany({
      chat: chat._id,
      user: req.user._id,
    });

    await chatModel.deleteOne({
      _id: chat._id,
      user: req.user._id,
    });

    return res.status(200).json({
      message: "Chat and its messages deleted successfully.",
      chatId: String(chat._id),
    });
  } catch (error) {
    console.error("Delete chat failed:", error);
    return res.status(500).json({
      message: "Could not completely delete the chat. Please try again.",
    });
  }
}

module.exports = {
  createChatController,
  getChatController,
  getMessagesController,
  renameChatController,
  deleteChatController,
};

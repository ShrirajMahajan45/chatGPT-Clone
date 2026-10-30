const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatControllers = require("../controllers/chat.controller");

const router = express.Router();

/* POST /api/chat/ */
router.post("/", authMiddleware.authUser, chatControllers.createChatController);

/* GET /api/chat/ To get all chats created by user*/
router.get("/", authMiddleware.authUser, chatControllers.getChatController);

/* PATCH /api/chat/chatID To rename chat */
router.patch(
  "/:id",
  authMiddleware.authUser,
  chatControllers.renameChatController,
);

/* DELETE /api/chat/chatID To DELETE the chat */

router.delete(
  "/:id",
  authMiddleware.authUser,
  chatControllers.deleteChatController,
);

/* GET /api/chat/chatID To get all messages in Chat*/
router.get(
  "/messages/:id",
  authMiddleware.authUser,
  chatControllers.getMessagesController,
);

module.exports = router;

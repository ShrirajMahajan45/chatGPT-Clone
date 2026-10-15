const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatControllers = require("../controllers/chat.controller");

const router = express.Router();

/* POST /api/chat/ */
router.post("/", authMiddleware.authUser, chatControllers.createChatController);

module.exports = router;

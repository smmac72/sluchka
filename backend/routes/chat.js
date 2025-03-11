const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticateJWT } = require("../middleware/auth");

// Get all user's chats
router.get("/", authenticateJWT, chatController.getUserChats);

// Get or create chat with another user
router.get("/:otherUserId", authenticateJWT, chatController.getChat);

// Add message to chat
router.post(
  "/:chatId/message",
  authenticateJWT,
  [check("content").notEmpty().withMessage("Content is required")],
  chatController.addMessage
);

// Mark messages as read
router.patch("/:chatId/read", authenticateJWT, chatController.markMessagesAsRead);

// Archive chat
router.patch("/:chatId/archive", authenticateJWT, chatController.archiveChat);

module.exports = router;

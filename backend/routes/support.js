const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Create support ticket
router.post(
  "/ticket",
  authenticateJWT,
  [
    check("subject", "Subject is required").notEmpty(),
    check("category", "Valid category is required").isIn(["account", "payment", "technical", "verification", "report", "other"]),
    check("message", "Message is required").notEmpty()
  ],
  supportController.createTicket
);

// Get user tickets
router.get("/tickets", authenticateJWT, supportController.getUserTickets);

// Get ticket by ID
router.get("/ticket/:id", authenticateJWT, supportController.getTicketById);

// Add reply to ticket
router.post(
  "/ticket/:id/reply",
  authenticateJWT,
  [check("message", "Message is required").notEmpty()],
  supportController.addReply
);

// Close ticket
router.patch("/ticket/:id/close", authenticateJWT, supportController.closeTicket);

// Get FAQ
router.get("/faq", supportController.getFAQ);

module.exports = router;

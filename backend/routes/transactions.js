const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const transactionsController = require("../controllers/transactionsController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Get user transactions
router.get("/", authenticateJWT, transactionsController.getUserTransactions);

// Get transaction by ID
router.get("/:id", authenticateJWT, transactionsController.getTransactionById);

// Create new transaction
router.post(
  "/",
  authenticateJWT,
  [
    check("to", "Recipient ID is required").notEmpty(),
    check("amount", "Valid amount is required").isNumeric(),
    check("transactionType", "Transaction type is required").isIn(["promotion", "service", "premium", "donation"])
  ],
  transactionsController.createTransaction
);

// Update transaction status (admin only)
router.patch("/:id/status", authenticateJWT, isAdmin, transactionsController.updateTransactionStatus);

module.exports = router;

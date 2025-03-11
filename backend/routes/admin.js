const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Admin dashboard data
router.get("/dashboard", authenticateJWT, isAdmin, adminController.getDashboardData);

// Get users list
router.get("/users", authenticateJWT, isAdmin, adminController.getUsers);

// Verify user
router.patch("/users/:id/verify", authenticateJWT, isAdmin, adminController.verifyUser);

// Get ads list
router.get("/ads", authenticateJWT, isAdmin, adminController.getAds);

// Moderate ad
router.patch("/ads/:id/moderate", authenticateJWT, isAdmin, adminController.moderateAd);

// Get pending documents
router.get("/documents/pending", authenticateJWT, isAdmin, adminController.getPendingDocuments);

// Get support tickets
router.get("/support/tickets", authenticateJWT, isAdmin, adminController.getSupportTickets);

// Assign support ticket
router.patch("/support/tickets/:id/assign", authenticateJWT, isAdmin, adminController.assignTicket);

// Get transaction analytics
router.get("/analytics/transactions", authenticateJWT, isAdmin, adminController.getTransactionAnalytics);

module.exports = router;

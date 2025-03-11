const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const adsController = require("../controllers/adsController");
const { authenticateJWT } = require("../middleware/auth");

// Get all ads
router.get("/", adsController.getAllAds);

// Get ad by ID
router.get("/:id", adsController.getAdById);

// Get user ads
router.get("/user/my-ads", authenticateJWT, adsController.getUserAds);

// Create new ad
router.post(
  "/",
  authenticateJWT,
  [
    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty()
  ],
  adsController.createAd
);

// Update ad
router.put("/:id", authenticateJWT, adsController.updateAd);

// Delete ad
router.delete("/:id", authenticateJWT, adsController.deleteAd);

// Search ads
router.post("/search", adsController.searchAds);

// Update status
router.patch("/:id/status", authenticateJWT, adsController.updateStatus);

// Promote ad
router.post("/:id/promote", authenticateJWT, adsController.promoteAd);

module.exports = router;

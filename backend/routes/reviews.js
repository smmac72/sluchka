const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Get user reviews
router.get("/user/:userId", reviewsController.getUserReviews);

// Get animal reviews
router.get("/animal/:animalId", reviewsController.getAnimalReviews);

// Create new review
router.post(
  "/",
  authenticateJWT,
  [
    check("target", "Target ID is required").notEmpty(),
    check("targetType", "Target type is required").isIn(["user", "animal"]),
    check("rating", "Rating is required").isInt({ min: 1, max: 5 })
  ],
  reviewsController.createReview
);

// Update review
router.put("/:id", authenticateJWT, reviewsController.updateReview);

// Delete review
router.delete("/:id", authenticateJWT, reviewsController.deleteReview);

module.exports = router;

const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const animalsController = require("../controllers/animalsController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Get all user's animals
router.get("/", authenticateJWT, animalsController.getUserAnimals);

// Get animal by ID
router.get("/:id", animalsController.getAnimalById);

// Create new animal
router.post(
  "/",
  authenticateJWT,
  [
    check("name", "Name is required").notEmpty(),
    check("species", "Species is required").notEmpty(),
    check("breed", "Breed is required").notEmpty(),
    check("gender", "Gender is required").notEmpty()
  ],
  animalsController.createAnimal
);

// Update animal
router.put("/:id", authenticateJWT, animalsController.updateAnimal);

// Delete animal
router.delete("/:id", authenticateJWT, animalsController.deleteAnimal);

// Add document to animal
router.post("/:id/documents", authenticateJWT, animalsController.addDocument);

// Verify animal (admin only)
router.patch("/:id/verify", authenticateJWT, isAdmin, animalsController.verifyAnimal);

module.exports = router;

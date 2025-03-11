const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateJWT } = require("../middleware/auth");

// Register
router.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty()
  ],
  authController.register
);

// Login
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  authController.login
);

// Get current user
router.get("/me", authenticateJWT, authController.getCurrentUser);

// Update profile
router.put(
  "/profile",
  authenticateJWT,
  authController.updateProfile
);

// Change password
router.put(
  "/password",
  authenticateJWT,
  [
    check("currentPassword", "Current password is required").exists(),
    check("newPassword", "New password must be at least 6 characters").isLength({ min: 6 })
  ],
  authController.changePassword
);

// Verify email
router.post("/verify-email", authenticateJWT, authController.verifyEmail);

// Verify phone
router.post("/verify-phone", authenticateJWT, authController.verifyPhone);

module.exports = router;

const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { authenticateJWT } = require("../middleware/auth");

// Get user's schedules
router.get("/", authenticateJWT, scheduleController.getUserSchedules);

// Get schedule by ID
router.get("/:id", authenticateJWT, scheduleController.getScheduleById);

// Create new schedule
router.post(
  "/",
  authenticateJWT,
  [
    check("ad", "Ad ID is required").notEmpty(),
    check("proposedDate", "Proposed date is required").notEmpty(),
    check("location", "Location is required").notEmpty()
  ],
  scheduleController.createSchedule
);

// Update schedule details
router.put("/:id", authenticateJWT, scheduleController.updateSchedule);

// Update schedule status
router.patch("/:id/status", authenticateJWT, scheduleController.updateStatus);

module.exports = router;

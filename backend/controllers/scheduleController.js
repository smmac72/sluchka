const Schedule = require("../models/Schedule");
const Ad = require("../models/Ad");
const { validationResult } = require("express-validator");

// Get user's schedules (both as requester and responder)
exports.getUserSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const schedules = await Schedule.find({
      $or: [{ requester: userId }, { responder: userId }]
    })
    .populate("ad", "title")
    .populate("requester", "firstName lastName profilePicture")
    .populate("responder", "firstName lastName profilePicture")
    .sort({ proposedDate: 1 });
    
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ad, proposedDate, location, locationDetails, additionalNotes } = req.body;

  try {
    // Get the ad to identify the responder (ad owner)
    const adData = await Ad.findById(ad);
    
    if (!adData) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    const newSchedule = new Schedule({
      ad,
      requester: req.user.userId,
      responder: adData.owner,
      proposedDate,
      location,
      locationDetails: locationDetails || {},
      additionalNotes: additionalNotes || ""
    });

    const schedule = await newSchedule.save();
    
    // Populate the response
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("ad", "title")
      .populate("requester", "firstName lastName profilePicture")
      .populate("responder", "firstName lastName profilePicture");
    
    res.json(populatedSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update schedule status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!["pending", "confirmed", "completed", "canceled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  
  try {
    const userId = req.user.userId;
    let schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    // Check authorization - only participants can update status
    if (schedule.requester.toString() !== userId && schedule.responder.toString() !== userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Specific rules for status changes
    if (status === "confirmed" && schedule.responder.toString() !== userId) {
      return res.status(401).json({ message: "Only the responder can confirm" });
    }
    
    schedule.status = status;
    await schedule.save();
    
    // Return the updated schedule with populated fields
    const updatedSchedule = await Schedule.findById(schedule._id)
      .populate("ad", "title")
      .populate("requester", "firstName lastName profilePicture")
      .populate("responder", "firstName lastName profilePicture");
    
    res.json(updatedSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const schedule = await Schedule.findById(req.params.id)
      .populate("ad", "title")
      .populate("requester", "firstName lastName profilePicture")
      .populate("responder", "firstName lastName profilePicture");
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    // Check if user is authorized to view this schedule
    if (schedule.requester.toString() !== userId && schedule.responder.toString() !== userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update schedule details
exports.updateSchedule = async (req, res) => {
  const { proposedDate, location, locationDetails, additionalNotes } = req.body;
  
  try {
    const userId = req.user.userId;
    let schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    // Only pending schedules can be updated
    if (schedule.status !== "pending") {
      return res.status(400).json({ message: "Only pending schedules can be updated" });
    }
    
    // Check if user is authorized to update this schedule
    if (schedule.requester.toString() !== userId && schedule.responder.toString() !== userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    if (proposedDate) schedule.proposedDate = proposedDate;
    if (location) schedule.location = location;
    if (locationDetails) schedule.locationDetails = locationDetails;
    if (additionalNotes !== undefined) schedule.additionalNotes = additionalNotes;
    
    await schedule.save();
    
    // Return the updated schedule with populated fields
    const updatedSchedule = await Schedule.findById(schedule._id)
      .populate("ad", "title")
      .populate("requester", "firstName lastName profilePicture")
      .populate("responder", "firstName lastName profilePicture");
    
    res.json(updatedSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

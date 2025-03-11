const Review = require("../models/Review");
const User = require("../models/User");
const Animal = require("../models/Animal");
const { validationResult } = require("express-validator");

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const targetId = req.params.userId;
    
    // Validate that the target user exists
    const userExists = await User.exists({ _id: targetId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const reviews = await Review.find({ 
      target: targetId,
      targetType: "user"
    })
    .populate("reviewer", "firstName lastName profilePicture")
    .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get animal reviews
exports.getAnimalReviews = async (req, res) => {
  try {
    const targetId = req.params.animalId;
    
    // Validate that the target animal exists
    const animalExists = await Animal.exists({ _id: targetId });
    if (!animalExists) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    const reviews = await Review.find({ 
      target: targetId,
      targetType: "animal"
    })
    .populate("reviewer", "firstName lastName profilePicture")
    .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new review
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { target, targetType, rating, title, comment } = req.body;

  try {
    // Validate that the target exists
    let targetExists;
    if (targetType === "user") {
      targetExists = await User.exists({ _id: target });
    } else if (targetType === "animal") {
      targetExists = await Animal.exists({ _id: target });
    }
    
    if (!targetExists) {
      return res.status(404).json({ message: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} not found` });
    }
    
    // Check if user already reviewed this target
    const existingReview = await Review.findOne({
      reviewer: req.user.userId,
      target,
      targetType
    });
    
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this item" });
    }
    
    const newReview = new Review({
      reviewer: req.user.userId,
      target,
      targetType,
      rating,
      title: title || "",
      comment: comment || ""
    });

    const review = await newReview.save();
    
    // Populate reviewer data
    const populatedReview = await Review.findById(review._id)
      .populate("reviewer", "firstName lastName profilePicture");
    
    res.json(populatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;

  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user is authorized to update the review
    if (review.reviewer.toString() !== req.user.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Save current version to edit history
    review.editHistory.push({
      rating: review.rating,
      comment: review.comment,
      editedAt: new Date()
    });
    
    // Update fields
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    
    await review.save();
    
    // Populate reviewer data
    const updatedReview = await Review.findById(review._id)
      .populate("reviewer", "firstName lastName profilePicture");
    
    res.json(updatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user is authorized to delete the review
    if (review.reviewer.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    await review.deleteOne();
    
    res.json({ message: "Review removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

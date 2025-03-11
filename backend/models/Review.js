const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["user", "animal"], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  editHistory: [{
    rating: { type: Number },
    comment: { type: String },
    editedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);

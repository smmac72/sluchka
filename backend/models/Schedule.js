const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  ad: { type: mongoose.Schema.Types.ObjectId, ref: "Ad", required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  proposedDate: { type: Date, required: true },
  location: { type: String, required: true },
  locationDetails: { type: Object },
  additionalNotes: { type: String },
  status: { type: String, enum: ["pending", "confirmed", "completed", "canceled"], default: "pending" },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", ScheduleSchema);

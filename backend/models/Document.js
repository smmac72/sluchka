const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal" },
  type: { type: String, enum: ["veterinary", "pedigree", "award", "chip"], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Document", DocumentSchema);

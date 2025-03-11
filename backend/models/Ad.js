const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal" },
  images: [{ type: String }],
  purpose: { type: String, enum: ["breeding", "pet", "exhibition"], default: "breeding" },
  dealStatus: { type: String, enum: ["Общение", "Сделал предложение", "В ожидании случки", "Завершено"], default: "Общение" },
  price: { type: Number },
  location: { type: String },
  views: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  lastPromoted: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Ad", AdSchema);

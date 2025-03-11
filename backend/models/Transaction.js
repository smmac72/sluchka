const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ad: { type: mongoose.Schema.Types.ObjectId, ref: "Ad" },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "RUB" },
  status: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" },
  transactionType: { type: String, enum: ["promotion", "service", "premium", "donation"], required: true },
  paymentMethod: { type: String },
  paymentId: { type: String },
  description: { type: String },
  receipt: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);

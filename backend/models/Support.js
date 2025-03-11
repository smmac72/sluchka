const mongoose = require("mongoose");

const TicketMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isAdmin: { type: Boolean, default: false },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

const SupportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ["account", "payment", "technical", "verification", "report", "other"], required: true },
  status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  messages: [TicketMessageSchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastResponseBy: { type: String, enum: ["user", "admin"] },
  closedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);

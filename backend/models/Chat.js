const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  attachments: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  ad: { type: mongoose.Schema.Types.ObjectId, ref: "Ad" },
  lastMessage: { type: Date },
  messages: [MessageSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Chat", ChatSchema);

const Chat = require("../models/Chat");
const { validationResult } = require("express-validator");

// Get all user chats
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const chats = await Chat.find({ participants: userId, active: true })
      .populate("participants", "firstName lastName profilePicture")
      .populate("ad", "title")
      .sort({ lastMessage: -1 });
      
    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get or create chat between users
exports.getChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;
    const { adId } = req.query;
    
    // Validate other user ID
    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }
    
    // Check if chat already exists
    let query = {
      participants: { $all: [userId, otherUserId] },
      active: true
    };
    
    // If adId is provided, include it in the query
    if (adId) {
      query.ad = adId;
    }
    
    let chat = await Chat.findOne(query)
      .populate("participants", "firstName lastName profilePicture")
      .populate("ad", "title");
      
    // If chat doesn't exist, create a new one
    if (!chat) {
      chat = new Chat({
        participants: [userId, otherUserId],
        messages: [],
        lastMessage: new Date(),
        ad: adId || undefined
      });
      
      await chat.save();
      
      chat = await Chat.findById(chat._id)
        .populate("participants", "firstName lastName profilePicture")
        .populate("ad", "title");
    }
    
    res.json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add message to chat
exports.addMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { content, attachments } = req.body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: "Message content or attachments required" });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to access this chat" });
    }
    
    // Add the message
    const newMessage = {
      sender: userId,
      content: content || "",
      attachments: attachments || [],
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();
    
    res.json({
      message: "Message sent",
      chatMessage: newMessage
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to access this chat" });
    }
    
    // Mark unread messages as read
    let updated = false;
    
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
        updated = true;
      }
    });
    
    if (updated) {
      await chat.save();
    }
    
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Archive (deactivate) a chat
exports.archiveChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to access this chat" });
    }
    
    chat.active = false;
    await chat.save();
    
    res.json({ message: "Chat archived" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

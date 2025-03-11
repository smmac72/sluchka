const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const adsRoutes = require("./routes/ads");
const animalsRoutes = require("./routes/animals");
const scheduleRoutes = require("./routes/schedule");
const documentRoutes = require("./routes/documents");
const reviewRoutes = require("./routes/reviews");
const transactionRoutes = require("./routes/transactions");
const supportRoutes = require("./routes/support");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser and useUnifiedTopology are now default in mongoose 6+
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection error: " + err.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Create HTTP server and attach Socket.IO for chat
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);
  
  // Join a chat room
  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });
  
  // Leave a chat room
  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left room ${chatId}`);
  });
  
  // Handle chat messages
  socket.on("chat message", (msg) => {
    console.log(`Message in ${msg.chatId}: ${msg.content}`);
    io.to(msg.chatId).emit("chat message", msg);
  });
  
  // Handle read receipts
  socket.on("message read", ({ chatId, userId }) => {
    socket.to(chatId).emit("message read", { chatId, userId });
  });
  
  // Handle typing indicators
  socket.on("typing", ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit("typing", { chatId, userId, isTyping });
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("API server running on port " + PORT);
  console.log("Environment: " + (process.env.NODE_ENV || "development"));
});

module.exports = app;

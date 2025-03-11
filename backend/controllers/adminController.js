const User = require("../models/User");
const Ad = require("../models/Ad");
const Animal = require("../models/Animal");
const Document = require("../models/Document");
const Transaction = require("../models/Transaction");
const SupportTicket = require("../models/Support");
const Review = require("../models/Review");

// Get admin dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get counts and stats
    const [
      userCount,
      newUsersToday,
      adCount,
      activeAds,
      animalCount,
      documentCount,
      verifiedDocuments,
      pendingDocuments,
      transactionCount,
      transactionTotal,
      openTickets,
      recentUsers,
      recentAds,
      recentTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
      }),
      Ad.countDocuments(),
      Ad.countDocuments({ active: true }),
      Animal.countDocuments(),
      Document.countDocuments(),
      Document.countDocuments({ verified: true }),
      Document.countDocuments({ verified: false }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      SupportTicket.countDocuments({ status: { $in: ["open", "in-progress"] } }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName email createdAt isKennel verifiedSeller"),
      Ad.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "firstName lastName")
        .select("title views createdAt verified"),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("from to", "firstName lastName")
        .select("amount currency status transactionType createdAt")
    ]);
    
    const stats = {
      userCount,
      newUsersToday,
      adCount,
      activeAds,
      animalCount,
      documentCount,
      verifiedDocuments,
      pendingDocuments,
      transactionCount,
      transactionTotal: transactionTotal.length ? transactionTotal[0].total : 0,
      openTickets,
      recentUsers,
      recentAds,
      recentTransactions
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify user
exports.verifyUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.verifiedSeller = true;
    await user.save();
    
    res.json({ message: "User verified successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Moderate ad
exports.moderateAd = async (req, res) => {
  const { approved, reason } = req.body;
  
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    ad.verified = approved;
    await ad.save();
    
    // In a real app, send notification to the user about moderation result
    
    res.json({ message: approved ? "Ad approved" : "Ad rejected", ad });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get users list (admin only)
exports.getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("firstName lastName email isKennel verifiedSeller createdAt");
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get ads list (admin only)
exports.getAds = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const ads = await Ad.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "firstName lastName")
      .populate("animal", "name species breed");
    
    const total = await Ad.countDocuments();
    
    res.json({
      ads,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get documents pending verification
exports.getPendingDocuments = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const documents = await Document.find({ verified: false })
      .sort({ createdAt: -1 })
      .populate("owner", "firstName lastName")
      .populate("animal", "name species breed");
    
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get support tickets for admin
exports.getSupportTickets = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const status = req.query.status; // Optional filter by status
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const tickets = await SupportTicket.find(query)
      .sort({ updatedAt: -1 })
      .populate("user", "firstName lastName email")
      .populate("assignedTo", "firstName lastName");
    
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Assign support ticket to admin
exports.assignTicket = async (req, res) => {
  const { adminId } = req.body;
  
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    ticket.assignedTo = adminId || req.user.userId;
    if (ticket.status === "open") {
      ticket.status = "in-progress";
    }
    
    await ticket.save();
    
    res.json({ message: "Ticket assigned successfully", ticket });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get transaction analytics
exports.getTransactionAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get revenue by type
    const revenueByType = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: {
          _id: "$transactionType",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRevenue = await Transaction.aggregate([
      { $match: {
          status: "completed",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      revenueByType,
      dailyRevenue
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

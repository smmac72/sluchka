const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }]
    })
    .populate("from", "firstName lastName")
    .populate("to", "firstName lastName")
    .populate("ad", "title")
    .populate("animal", "name species breed")
    .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { to, ad, animal, amount, currency, transactionType, paymentMethod, description } = req.body;

  try {
    // Validate required fields based on transaction type
    if (!to || !amount || !transactionType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate transaction type
    if (!["promotion", "service", "premium", "donation"].includes(transactionType)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }
    
    const newTransaction = new Transaction({
      from: req.user.userId,
      to,
      ad: ad || null,
      animal: animal || null,
      amount,
      currency: currency || "RUB",
      transactionType,
      paymentMethod: paymentMethod || null,
      description: description || "",
      status: "pending" // All transactions start as pending in this system
    });

    const transaction = await newTransaction.save();
    
    // In a real application, here you would integrate with a payment processor
    // For simulation purposes, let's auto-complete the transaction
    transaction.status = "completed";
    await transaction.save();
    
    // Populate fields for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("from", "firstName lastName")
      .populate("to", "firstName lastName")
      .populate("ad", "title")
      .populate("animal", "name species breed");
    
    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const transaction = await Transaction.findById(req.params.id)
      .populate("from", "firstName lastName")
      .populate("to", "firstName lastName")
      .populate("ad", "title")
      .populate("animal", "name species breed");
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Check if user is authorized to view this transaction
    if (transaction.from.toString() !== userId && transaction.to.toString() !== userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update transaction status (mainly for admins)
exports.updateTransactionStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!["pending", "completed", "canceled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  
  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Only admins can update transactions
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    transaction.status = status;
    await transaction.save();
    
    // Populate fields for response
    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate("from", "firstName lastName")
      .populate("to", "firstName lastName")
      .populate("ad", "title")
      .populate("animal", "name species breed");
    
    res.json(updatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

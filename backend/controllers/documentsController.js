const Document = require("../models/Document");
const { validationResult } = require("express-validator");

// Get all user's documents
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Upload new document
exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { type, title, animalId } = req.body;

  if (!type || !["veterinary", "pedigree", "award", "chip"].includes(type)) {
    return res.status(400).json({ message: "Valid document type is required" });
  }

  if (!title) {
    return res.status(400).json({ message: "Document title is required" });
  }

  try {
    // In a production environment, you would upload to cloud storage
    // and get a URL, but for this example we'll use a local path
    const fileUrl = `/uploads/${req.file.filename}`;

    const newDocument = new Document({
      owner: req.user.userId,
      animal: animalId || null,
      type,
      title,
      fileUrl
    });

    const document = await newDocument.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify document (admin only)
exports.verifyDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // In a real app, verify admin status
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    document.verified = true;
    document.verifiedBy = req.user.userId;
    document.verifiedAt = new Date();
    await document.save();
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Check if user is authorized to delete the document
    if (document.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // In a production app, you would also delete the file from storage
    
    await document.deleteOne();
    
    res.json({ message: "Document removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

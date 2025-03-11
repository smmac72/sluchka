const express = require("express");
const router = express.Router();
const documentsController = require("../controllers/documentsController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and common document formats
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  }
});

// Get all user's documents
router.get("/", authenticateJWT, documentsController.getUserDocuments);

// Get document by ID
router.get("/:id", documentsController.getDocumentById);

// Upload new document
router.post(
  "/",
  authenticateJWT,
  upload.single('file'),
  documentsController.uploadDocument
);

// Verify document (admin only)
router.patch("/:id/verify", authenticateJWT, isAdmin, documentsController.verifyDocument);

// Delete document
router.delete("/:id", authenticateJWT, documentsController.deleteDocument);

module.exports = router;

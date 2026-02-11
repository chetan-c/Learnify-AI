// server/routes/pdfRoutes.js

import express from 'express';
import multer from 'multer';
import { uploadPDF, getMyPDFs, deletePDF } from '../controllers/pdfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ===============================
   Multer Configuration
================================ */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB Limit
});

/* ===============================
   Routes
================================ */

// Upload PDF
router.post('/upload', protect, upload.single('pdf'), uploadPDF);

// Get my PDFs
router.get('/', protect, getMyPDFs);

// Delete a PDF
router.delete('/:id', protect, deletePDF);

export default router;

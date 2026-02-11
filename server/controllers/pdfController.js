// server/controllers/pdfController.js

import fs from 'fs';
import PDF from '../models/PDF.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { extractKnowledgeBase } from '../utils/knowledgeBaseService.js';

// @route   POST /api/pdf/upload
// @access  Private
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // Daily limit check: Max 10 PDFs per user per day
    if (req.user.role !== 'admin') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const uploadCount = await PDF.countDocuments({ user: req.user._id, createdAt: { $gte: startOfDay } });

      if (uploadCount >= 10) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(429).json({
          message: 'Daily upload limit reached. You can only upload 10 PDFs per day.'
        });
      }
    }

    // 1. Extract raw text from PDF
    const extractedText = await extractTextFromPDF(req.file.path);

    // 2. Extract Knowledge Base Metadata using Service
    const metadata = await extractKnowledgeBase(extractedText);

    const pdf = await PDF.create({
      user: req.user._id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      size: req.file.size,
      extractedText,
      metadata,
      isProcessed: true,
    });

    res.status(201).json(pdf);
  } catch (error) {
    console.error('[PDF Upload] Error:', error.message);
    console.error('[PDF Upload] Stack:', error.stack);

    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`[PDF Upload] Cleaned up failed upload: ${req.file.path}`);
      } catch (cleanupErr) {
        console.error(`[PDF Upload] Cleanup failed:`, cleanupErr.message);
      }
    }

    // Return appropriate error codes
    if (error.message && error.message.includes('PDF')) {
      return res.status(422).json({ message: 'Unable to extract text from PDF. Please ensure it is a valid text-based PDF document.' });
    }
    res.status(500).json({ message: 'Failed to process PDF upload. Please try again.' });
  }
};

// @route   GET /api/pdf
// @access  Private
export const getMyPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user._id }).select('-extractedText').sort('-createdAt');
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/pdf/:id
// @access  Private
export const deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Best-effort cleanup of the underlying file (do not fail request if this errors)
    if (pdf.filePath && fs.existsSync(pdf.filePath)) {
      try {
        fs.unlinkSync(pdf.filePath);
      } catch (cleanupError) {
        console.error('[PDF Delete] File cleanup failed:', cleanupError.message);
      }
    }

    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

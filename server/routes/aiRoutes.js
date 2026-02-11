import express from 'express';
import {
    askAI,
    generateMCQs,
    generateExam,
    generateNotes,
    aiHealth,
} from '../controllers/aiController.js';
import { downloadContent } from '../controllers/downloadController.js';
import { checkActiveSubscription } from '../middleware/subscriptionMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(aiLimiter); // Apply AI specific limits to all routes in this file

// Public health endpoint
router.get('/health', aiHealth);

// Ask AI question based on uploaded PDF
router.post('/ask', protect, checkActiveSubscription, askAI);

// Generate MCQs
router.post('/generate-mcqs', protect, checkActiveSubscription, generateMCQs);

// Generate Exam
router.post('/generate-exam', protect, checkActiveSubscription, generateExam);

// Generate Notes
router.post('/generate-notes', protect, checkActiveSubscription, generateNotes);

// Download AI outputs (PDF / TXT)
router.post('/download', protect, downloadContent);

export default router;

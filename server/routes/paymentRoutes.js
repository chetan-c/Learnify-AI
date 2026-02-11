// server/routes/paymentRoutes.js

import express from 'express';
import {
  createOrder,
  verifyPayment,
  requestManualPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment order
router.post('/create-order', protect, createOrder);

// Verify payment & activate subscription
router.post('/verify', protect, verifyPayment);

// Request manual payment verification
router.post('/manual-request', protect, requestManualPayment);

export default router;

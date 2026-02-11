// server/routes/adminRoutes.js

import express from 'express';
import {
    getAllUsers,
    getAllPayments,
    verifyManualPayment,
    getAllPDFs,
    overrideSubscription,
    getSystemStats,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes here are admin only and rate limited
router.use(apiLimiter);
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/pdfs', getAllPDFs); // New: View all PDFs
router.get('/payments', getAllPayments);
router.get('/stats', getSystemStats); // New: Analytics
router.post('/verify-payment', verifyManualPayment);
router.post('/override-subscription', overrideSubscription); // New: Admin Override

export default router;

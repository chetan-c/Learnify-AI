// server/routes/resultRoutes.js
import express from 'express';
import {
    saveResult,
    getUserResults,
    getResultById
} from '../controllers/resultController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, checkActiveSubscription, saveResult)
    .get(protect, getUserResults);

router.route('/:id')
    .get(protect, getResultById);

export default router;

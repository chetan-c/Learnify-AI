import express from 'express';
import {
  registerUser,
  loginUser,
} from '../controllers/authController.js';

import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;

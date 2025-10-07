 // backend/src/routes/authRoutes.ts

import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);

export default router;
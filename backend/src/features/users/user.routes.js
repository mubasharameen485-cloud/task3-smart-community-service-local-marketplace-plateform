import express from 'express';
import { getUserDashboard } from './user.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.get('/dashboard', verifyToken, getUserDashboard);

export default router;
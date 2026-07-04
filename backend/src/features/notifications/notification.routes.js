import express from 'express';
import { getMyNotifications, markAsRead } from './notification.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getMyNotifications);
router.put('/mark-read', verifyToken, markAsRead);

export default router;
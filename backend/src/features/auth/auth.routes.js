import express from 'express';
import { register, login, updateProfile, forgotPassword, resetPassword } from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); // 🟢 NEW
router.put('/reset-password/:token', resetPassword); // 🟢 NEW
router.put('/profile', verifyToken, upload.single('profilePic'), updateProfile);

export default router;
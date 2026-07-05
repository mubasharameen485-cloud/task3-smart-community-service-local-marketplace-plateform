import express from 'express';
import { getPlatformStats, toggleUserSuspension,removeListing } from './admin.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';


const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
};

const router = express.Router();
router.get('/stats', verifyToken, authorizeAdmin, getPlatformStats);
router.patch('/users/:id/suspend', verifyToken, authorizeAdmin, toggleUserSuspension);
router.delete('/listings/:type/:id', verifyToken, authorizeAdmin, removeListing);

export default router;
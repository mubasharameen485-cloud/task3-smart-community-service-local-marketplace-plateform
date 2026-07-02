import express from 'express';
import { createBooking, getMyBookings, updateBookingStatus } from './booking.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getMyBookings);
router.patch('/:id/status', verifyToken, updateBookingStatus);

export default router;
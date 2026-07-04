import express from 'express';
import { submitReview, getSellerReviews } from './review.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, submitReview);
router.get('/:sellerId', getSellerReviews);

export default router;
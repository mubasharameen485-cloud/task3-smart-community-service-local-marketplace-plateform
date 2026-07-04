import Review from './review.model.js';
import User from '../auth/auth.model.js';
import { sendNotification } from '../notifications/notification.controller.js'; 

export const submitReview = async (req, res) => {
    try {
        const { sellerId, rating, comment } = req.body;
        const reviewerId = req.user.id;

        if (!sellerId || !rating || !comment) return res.status(400).json({ success: false, message: 'All fields are required' });
        if (String(sellerId) === String(reviewerId)) return res.status(400).json({ success: false, message: 'You cannot review yourself' });

        const newReview = await Review.create({ reviewer: reviewerId, seller: sellerId, rating: Number(rating), comment });

        const allReviews = await Review.find({ seller: sellerId });
        const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = (totalRating / allReviews.length).toFixed(1);

        await User.findByIdAndUpdate(sellerId, { $set: { 'profile.averageRating': averageRating } });

        
        await sendNotification(req, sellerId, 'REVIEW', `Someone gave you a ${rating}-star review!`);

        res.status(201).json({ success: true, message: 'Review submitted successfully', data: newReview });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error while submitting review' }); }
};

export const getSellerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId }).populate('reviewer', 'name profile.profilePicture').sort({ createdAt: -1 });
        const seller = await User.findById(req.params.sellerId).select('name profile.averageRating');
        res.status(200).json({ success: true, data: reviews, sellerReputation: seller?.profile?.averageRating || 0, totalReviews: reviews.length });
    } catch (error) { res.status(500).json({ success: false, message: 'Error fetching reviews' }); }
};
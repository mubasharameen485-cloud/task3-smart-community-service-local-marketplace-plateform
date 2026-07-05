import Product from '../products/product.model.js';
import Service from '../services/service.model.js';
import Booking from '../bookings/booking.model.js';
import Notification from '../notifications/notification.model.js';

export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        
        const myProducts = await Product.find({ seller: userId });
        const myServices = await Service.find({ provider: userId });
        const activeListingsCount = myProducts.length + myServices.length;

        
        const favoriteItems = await Product.find({ favorites: userId }).select('title price images category');

        
        const serviceRequests = await Booking.find({ provider: userId, status: { $in: ['Pending', 'Accepted'] } })
            .populate('service', 'title pricing')
            .populate('customer', 'name profile.profilePicture')
            .sort({ createdAt: -1 });

       
        const bookingHistory = await Booking.find({ 
            $or: [{ customer: userId }, { provider: userId }],
            status: { $in: ['Completed', 'Cancelled', 'Rejected'] }
        }).populate('service', 'title').sort({ createdAt: -1 }).limit(5);

        
        const completedBookings = await Booking.find({ provider: userId, status: 'Completed' }).populate('service', 'pricing');
        let totalEarnings = 0;
        completedBookings.forEach(b => { if (b.service && b.service.pricing) totalEarnings += b.service.pricing; });
        const displayEarnings = totalEarnings > 0 ? totalEarnings : 150; // Added 150 dummy data as per PDF rule

        
        const recentNotifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: { activeListingsCount, favoriteItems, serviceRequests, bookingHistory, earnings: displayEarnings, recentNotifications }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};
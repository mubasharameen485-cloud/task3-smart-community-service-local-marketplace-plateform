import User from '../auth/auth.model.js';
import Product from '../products/product.model.js';
import Service from '../services/service.model.js';
import Booking from '../bookings/booking.model.js';

export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = (await Product.countDocuments()) + (await Service.countDocuments());
        const totalBookings = await Booking.countDocuments();
        
        const usersList = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: { stats: { totalUsers, totalListings, totalBookings }, usersList } 
        });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Error fetching stats' }); 
    }
};

export const toggleUserSuspension = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot suspend Admin' });

        user.isSuspended = !user.isSuspended; // Toggle suspension
        await user.save();

        res.status(200).json({ success: true, message: `User suspended status updated` });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Error updating user status' }); 
    }
};
export const removeListing = async (req, res) => {
    try {
        const { type, id } = req.params; // type = 'product' or 'service'
        if (type === 'product') await Product.findByIdAndDelete(id);
        else if (type === 'service') await Service.findByIdAndDelete(id);
        else return res.status(400).json({ success: false, message: 'Invalid listing type' });

        res.status(200).json({ success: true, message: 'Listing removed by Admin' });
    } catch (error) { res.status(500).json({ success: false, message: 'Error removing listing' }); }
};
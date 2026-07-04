import Notification from './notification.model.js';

// Helper function to create and emit notification (Used by other controllers)
export const sendNotification = async (req, recipientId, type, message) => {
    try {
        const notif = await Notification.create({ recipient: recipientId, type, message });
        const io = req.app.get('io'); // Extract Socket.io instance from Express App
        if (io) {
            io.to(String(recipientId)).emit('new_notification', notif); // Emit real-time!
        }
    } catch (error) {
        console.error("❌ Error sending notification:", error);
    }
};

// API: Get My Notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20); // Get last 20 notifications
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

// API: Mark all as read
export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notifications' });
    }
};
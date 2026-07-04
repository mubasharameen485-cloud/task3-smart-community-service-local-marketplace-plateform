import Booking from './booking.model.js';
import Service from '../services/service.model.js';
import { sendNotification } from '../notifications/notification.controller.js'; // 🟢 ADDED

export const createBooking = async (req, res) => {
    try {
        const { serviceId, preferredDate, preferredTime, notes } = req.body;
        const customerId = req.user.id;

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        if (String(service.provider) === String(customerId)) return res.status(400).json({ success: false, message: 'You cannot book your own service.' });

        const newBooking = await Booking.create({
            service: serviceId, provider: service.provider, customer: customerId, preferredDate, preferredTime, notes
        });

        // 🟢 NOTIFY PROVIDER
        await sendNotification(req, service.provider, 'BOOKING', `You have a new booking request for "${service.title}".`);

        res.status(201).json({ success: true, message: 'Booking requested successfully', data: newBooking });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error while booking' }); }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find({ $or: [{ provider: userId }, { customer: userId }] })
            .populate('service', 'title pricing category')
            .populate('customer', 'name email profile.profilePicture')
            .populate('provider', 'name email profile.profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) { res.status(500).json({ success: false, message: 'Error fetching bookings' }); }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findById(id).populate('service', 'title');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const isProvider = String(booking.provider) === String(userId);
        const isCustomer = String(booking.customer) === String(userId);

        if (!isProvider && !isCustomer) return res.status(403).json({ success: false, message: 'Unauthorized action' });
        if (isCustomer && status !== 'Cancelled') return res.status(403).json({ success: false, message: 'Customers can only cancel bookings.' });

        booking.status = status;
        await booking.save();

        // 🟢 NOTIFY THE OTHER PARTY
        const recipientId = isProvider ? booking.customer : booking.provider;
        await sendNotification(req, recipientId, 'BOOKING', `Booking status for "${booking.service.title}" updated to ${status}.`);

        res.status(200).json({ success: true, message: `Booking marked as ${status}` });
    } catch (error) { res.status(500).json({ success: false, message: 'Error updating booking status' }); }
};
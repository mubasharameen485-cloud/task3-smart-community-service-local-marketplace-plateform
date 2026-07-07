import Booking from './booking.model.js';
import Service from '../services/service.model.js';
import { sendNotification } from '../notifications/notification.controller.js';
import { sendEmailNotification } from '../../config/email.js'; //  DIRECT EMAIL

export const createBooking = async (req, res) => {
    try {
        const { serviceId, preferredDate, preferredTime, notes } = req.body;
        const customerId = req.user.id;

        const service = await Service.findById(serviceId).populate('provider', 'email name');
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        if (String(service.provider._id) === String(customerId)) return res.status(400).json({ success: false, message: 'You cannot book your own service.' });

        const newBooking = await Booking.create({
            service: serviceId, provider: service.provider._id, customer: customerId, preferredDate, preferredTime, notes
        });

        await sendNotification(req, service.provider._id, 'BOOKING', `You have a new booking request for "${service.title}".`);
        
        //  DIRECT EMAIL ALERT TO PROVIDER
        await sendEmailNotification(service.provider.email, 'New Service Booking Request', `Hello ${service.provider.name},\n\nYou have received a new booking request for your service: "${service.title}".\nDate: ${preferredDate}\nTime: ${preferredTime}\n\nPlease check your dashboard to accept or reject it.`);

        res.status(201).json({ success: true, message: 'Booking requested successfully', data: newBooking });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error while booking' }); }
};

export const getMyBookings = async (req, res) => {
    // same logic
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

        const booking = await Booking.findById(id).populate('service', 'title').populate('customer', 'email name').populate('provider', 'email name');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const isProvider = String(booking.provider._id) === String(userId);
        const isCustomer = String(booking.customer._id) === String(userId);

        if (!isProvider && !isCustomer) return res.status(403).json({ success: false, message: 'Unauthorized action' });
        if (isCustomer && status !== 'Cancelled') return res.status(403).json({ success: false, message: 'Customers can only cancel bookings.' });

        booking.status = status;
        await booking.save();

        const recipient = isProvider ? booking.customer : booking.provider;
        await sendNotification(req, recipient._id, 'BOOKING', `Booking status for "${booking.service.title}" updated to ${status}.`);

        // DIRECT EMAIL ALERT TO RECIPIENT
        await sendEmailNotification(recipient.email, `Booking Status Update: ${status}`, `Hello ${recipient.name},\n\nThe status of the booking for "${booking.service.title}" has been updated to: ${status}.\n\nCheck your dashboard for details.`);

        res.status(200).json({ success: true, message: `Booking marked as ${status}` });
    } catch (error) { res.status(500).json({ success: false, message: 'Error updating booking status' }); }
};
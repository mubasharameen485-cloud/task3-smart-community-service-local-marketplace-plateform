import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    preferredDate: { type: String, required: true }, // Formatted date string
    preferredTime: { type: String, required: true }, // e.g., "10:00 AM"
    notes: { type: String, default: '' }, // Special instructions from customer
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
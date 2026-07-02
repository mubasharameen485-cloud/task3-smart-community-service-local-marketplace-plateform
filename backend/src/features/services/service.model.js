import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Graphic Designing', 'Web Development', 'Photography', 'Home Services', 'Tutoring', 'Content Writing', 'Digital Marketing', 'Video Editing'],
        required: true 
    },
    pricing: { type: Number, required: true },
    estimatedDeliveryTime: { type: String, required: true }, // e.g., "3 Days"
    availability: { type: Boolean, default: true },
    portfolioImages: { type: [String], default: [] }, // Multiple Images
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
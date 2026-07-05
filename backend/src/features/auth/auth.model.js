import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['BUYER', 'SELLER', 'ADMIN'], default: 'BUYER' },
    isSuspended: { type: Boolean, default: false },
    
    // Nested Profile Object (As requested in PDF)
    profile: {
        profilePicture: { type: String, default: '' },
        bio: { type: String, default: '' },
        contactInformation: { type: String, default: '' },
        location: { type: String, default: '' },
        skills: { type: [String], default: [] }, // e.g. ["Plumbing", "Web Dev"]
        averageRating: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    image: { type: String, default: '' }, // BONUS: Image Sharing
    isRead: { type: Boolean, default: false } // BONUS: Read Receipts
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
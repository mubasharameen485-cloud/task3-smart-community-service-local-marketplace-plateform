import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] }, // Multiple Images
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // For Save Favorite
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
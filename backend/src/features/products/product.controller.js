import Product from './product.model.js';
import cloudinary from '../../config/cloudinary.js';
import path from 'path';
// Multiple Images Upload Helper
const uploadMultipleImages = async (files, folder) => {
    const urls = [];
    for (const file of files) {
        const url = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
                if (error) reject(error); else resolve(result.secure_url);
            });
            stream.end(file.buffer);
        });
        urls.push(url);
    }
    return urls;
};

export const createProduct = async (req, res) => {
    try {
        const { title, description, category, price } = req.body;
        let images = [];

        // LOCAL UPLOAD LOGIC FOR MULTIPLE IMAGES
        if (req.files && req.files.length > 0) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            images = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
        }

        const product = await Product.create({
            title, 
            description, 
            category, 
            price: Number(price), 
            images, 
            seller: req.user.id
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        let query = {};

        if (search) query.title = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query).populate('seller', 'name profile.profilePicture').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
        if (!product) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const index = product.favorites.indexOf(req.user.id);
        if (index > -1) product.favorites.splice(index, 1); // Unfavorite
        else product.favorites.push(req.user.id); // Favorite

        await product.save();
        res.status(200).json({ success: true, message: 'Favorites updated', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
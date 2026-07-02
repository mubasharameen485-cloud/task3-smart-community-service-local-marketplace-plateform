import Service from './service.model.js';
import cloudinary from '../../config/cloudinary.js';

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

export const createService = async (req, res) => {
    try {
        const { title, description, category, pricing, estimatedDeliveryTime, availability } = req.body;
        
        let portfolioImages = [];
        // 👈 LOCAL UPLOAD LOGIC
        if (req.files && req.files.length > 0) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            portfolioImages = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
        }

        const isAvailable = (availability === 'true' || availability === true || availability === undefined);

        const service = await Service.create({
            title, 
            description, 
            category, 
            pricing: Number(pricing), 
            estimatedDeliveryTime, 
            availability: isAvailable,
            portfolioImages, 
            provider: req.user.id
        });
        
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (category) query.category = category;

        const services = await Service.find(query).populate('provider', 'name profile.profilePicture').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({ _id: req.params.id, provider: req.user.id });
        if (!service) return res.status(403).json({ success: false, message: 'Unauthorized' });
        res.status(200).json({ success: true, message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
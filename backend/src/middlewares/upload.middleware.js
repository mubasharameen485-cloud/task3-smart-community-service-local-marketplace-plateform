import multer from 'multer';
import path from 'path';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ye folder hum abhi banayenge
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp + original name
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

export const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Only images (jpg, png, webp) are allowed!'));
    }
});
import User from './auth.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../../config/cloudinary.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot register as Admin' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'BUYER' });

        res.status(201).json({ success: true, message: 'Registered successfully', data: { id: newUser._id, name, email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        if(user.isSuspended) return res.status(403).json({message: "Account Suspended"});

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // Remove password before sending
        user.password = undefined;
        res.status(200).json({ success: true, token, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// Upload Helper
const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: 'teyzix_fs3_profiles',
                resource_type: "auto"
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, contactInformation, location, skills } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name) user.name = name;
        if (!user.profile) user.profile = {};
        if (bio !== undefined) user.profile.bio = bio;
        if (contactInformation !== undefined) user.profile.contactInformation = contactInformation;
        if (location !== undefined) user.profile.location = location;
        
        if (skills) {
            user.profile.skills = typeof skills === 'string' ? skills.split(',') : skills;
        }

        // --- LOCAL IMAGE UPLOAD LOGIC ---
        if (req.file) {
            // Hum image ka URL aise banayenge: http://localhost:5000/uploads/filename.jpg
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            user.profile.profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
            
            /* CLOUDINARY CODE (KEEPING FOR LATER)
            const result = await streamUpload(req.file.buffer);
            user.profile.profilePicture = result.secure_url;
            */
        }

        user.markModified('profile');
        await user.save();
        
        user.password = undefined;
        res.status(200).json({ success: true, message: 'Profile updated locally', user });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
};
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};
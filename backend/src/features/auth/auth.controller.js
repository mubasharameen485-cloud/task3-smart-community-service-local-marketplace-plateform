import User from './auth.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // 🟢 Zaroori import
import cloudinary from '../../config/cloudinary.js';
import { sendEmailNotification } from '../../config/email.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot register as Admin' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'BUYER' });

        // Email Alert
        await sendEmailNotification(email, 'Welcome to Smart Community!', `Hi ${name},\n\nWelcome to Teyzix Smart Community! Your account has been created successfully.`);

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
        
        if (user.isSuspended) {
            return res.status(403).json({ success: false, message: 'Your account is suspended.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.password = undefined;
        res.status(200).json({ success: true, token, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `You requested a password reset.\n\nClick here to reset your password: ${resetUrl}\n\nThis link is valid for 15 minutes.`;

        await sendEmailNotification(user.email, 'Password Reset Request', message);

        res.status(200).json({ success: true, message: 'Reset email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
    export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        let updateData = {};
        if (name) updateData.name = name;

        if (req.file) {
            updateData['profile.profilePicture'] = await uploadWithFallback(req.file, 'teyzix_users');
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error in updating profile' });
    }
};
};


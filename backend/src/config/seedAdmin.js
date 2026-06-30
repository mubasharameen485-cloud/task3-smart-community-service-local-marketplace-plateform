import bcrypt from 'bcrypt';
import User from '../features/auth/auth.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const setupAdminAccount = async () => {
    try {
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        const adminExists = await User.findOne({ email: ADMIN_EMAIL });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await User.create({
                name: 'System Admin',
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'ADMIN',
            });
            console.log(' Default Admin account created successfully.');
        }
    } catch (error) {
        console.error(' Admin Setup Error:', error.message);
    }
};
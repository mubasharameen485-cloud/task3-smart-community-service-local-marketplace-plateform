import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { connectDB } from './config/db.js';
import { setupAdminAccount } from './config/seedAdmin.js';
import authRoutes from './features/auth/auth.routes.js';
import path from 'path';

const app = express();

app.use(express.json());
app.use(cors());

connectDB().then(() => setupAdminAccount());

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads')); 
app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
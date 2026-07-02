import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { connectDB } from './config/db.js';
import { setupAdminAccount } from './config/seedAdmin.js';
import authRoutes from './features/auth/auth.routes.js';
import path from 'path';
import productRoutes from './features/products/product.routes.js';
import serviceRoutes from './features/services/service.routes.js';
import bookingRoutes from './features/bookings/booking.routes.js'; 
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
connectDB().then(() => setupAdminAccount());

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads')); 
app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
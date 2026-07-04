import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { setupAdminAccount } from './config/seedAdmin.js';

import authRoutes from './features/auth/auth.routes.js';
import productRoutes from './features/products/product.routes.js';
import serviceRoutes from './features/services/service.routes.js';
import bookingRoutes from './features/bookings/booking.routes.js';
import chatRoutes from './features/chat/chat.routes.js';
import reviewRoutes from './features/reviews/review.routes.js'; 
import notificationRoutes from './features/notifications/notification.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Server for Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Static Folder for Images (Very Important for local storage)
app.use('/uploads', express.static('uploads'));


app.set('io', io);

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    
    socket.on('join_user_room', (userId) => socket.join(String(userId)));

    socket.on('join_chat', (room) => socket.join(room));
    socket.on('send_message', (data) => io.to(data.room).emit('receive_message', data.messageObj));
    socket.on('delete_message', (data) => io.to(data.room).emit('message_deleted', data.msgId));
    socket.on('typing', (data) => socket.to(data.room).emit('display_typing', data.senderId));
    socket.on('stop_typing', (data) => socket.to(data.room).emit('hide_typing', data.senderId));
    socket.on('disconnect', () => console.log('User Disconnected:', socket.id));
});

app.use(express.json());
app.use(cors());

// Database
connectDB().then(() => setupAdminAccount());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
// Start Server
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
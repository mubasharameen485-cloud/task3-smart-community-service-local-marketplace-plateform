import express from 'express';
import { sendMessage, getChatHistory, deleteMessage } from './chat.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', verifyToken, upload.single('image'), sendMessage);
router.get('/:receiverId', verifyToken, getChatHistory);
router.delete('/:messageId', verifyToken, deleteMessage);

export default router;
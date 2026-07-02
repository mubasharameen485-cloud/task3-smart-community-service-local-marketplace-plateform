import express from 'express';
import { createService, getServices, deleteService } from './service.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();
router.post('/', verifyToken, upload.array('portfolioImages', 5), createService);
router.get('/', getServices);
router.delete('/:id', verifyToken, deleteService);

export default router;
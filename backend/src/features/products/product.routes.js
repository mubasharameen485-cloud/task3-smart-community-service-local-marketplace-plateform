import express from 'express';
import { createProduct, getProducts, deleteProduct, toggleFavorite } from './product.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();
router.post('/', verifyToken, upload.array('images', 5), createProduct); // Allow up to 5 images
router.get('/', getProducts);
router.delete('/:id', verifyToken, deleteProduct);
router.put('/:id/favorite', verifyToken, toggleFavorite);

export default router;
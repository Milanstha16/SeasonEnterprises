import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-stripe', protect, createOrder);
router.post('/create-paypal', protect, createOrder);

export default router;

import express from 'express';
import { createOrderWithStripe, createOrderWithPaypal } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// These routes will handle both Stripe and PayPal orders
// Added `protect` middleware to ensure the user is logged in before proceeding
router.post('/create-stripe', protect, createOrderWithStripe);
router.post('/create-paypal', protect, createOrderWithPaypal);

export default router;

import express from 'express';
import {
  createOrder,
  markPaid,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
} from '../controllers/orderController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to create an order
router.post('/create', protect, createOrder); // Ensure user is logged in before creating an order

// Route to mark an order as paid (probably from payment gateway callback)
router.post('/paid', protect, markPaid); // Ensure user is logged in before marking as paid

// Protected route to get user-specific orders (must be logged in)
router.get('/my-orders', protect, getUserOrders); // User-specific orders

// Route to get a specific order by ID (protected route for owner or admin)
router.get('/:id', protect, getOrder); // Get order by ID (admin or owner)

// Admin route to get all orders (admin route, requires admin permission)
router.get('/', protect, getAllOrders); // Admin only

// Protected route to update an order's status (admin only)
router.put('/:orderId/status', protect, updateOrderStatus); // Admin only for order status update

export default router;

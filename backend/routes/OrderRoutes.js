import express from 'express';
import { createOrder, markPaid, getOrder, getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

// Route to create a new order
router.post('/create', createOrder);

// Route to mark an order as paid (after payment is successful)
router.post('/paid', markPaid);

// Route to get an order by ID
router.get('/:id', getOrder);

// Route to get all orders (for admin panel)
router.get('/', getAllOrders);

export default router;

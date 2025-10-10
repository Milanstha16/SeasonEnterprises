import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

// Admin: Get all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch orders' });
  }
});

// ✅ User: Create new order (used in checkout)
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    const newOrder = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'pending',
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to place order' });
  }
});

export default router;

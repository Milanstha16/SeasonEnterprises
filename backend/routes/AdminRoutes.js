import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../admin/adminMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// All admin routes are protected + admin only
router.use(protect, requireAdmin);

// Quick stats for AdminDashboard
router.get('/stats', async (req, res) => {
try {
const [totalUsers, totalProducts] = await Promise.all([
User.countDocuments(),
Product.countDocuments(),
]);
res.json({ totalUsers, totalProducts });
} catch (err) {
res.status(500).json({ msg: 'Failed to fetch stats' });
}
});

// Example: list all products (admin view)
router.get('/products', async (req, res) => {
try {
const products = await Product.find().sort({ createdAt: -1 });
res.json(products);
} catch (err) {
res.status(500).json({ msg: 'Failed to fetch products' });
}
});

export default router;
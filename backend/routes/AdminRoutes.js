import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// All admin routes are protected + admin only
router.use(protect, adminOnly);

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

// List all products (admin view)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});

// ✅ Add new product (admin only)
router.post('/add-product', async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ msg: 'Name and price are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    await product.save();
    res.status(201).json({ msg: 'Product added successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to add product' });
  }
});

export default router;

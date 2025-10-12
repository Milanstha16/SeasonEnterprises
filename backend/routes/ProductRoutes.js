import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Setup multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }

    cb(null, true);
  },
});

// Public route: List all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Add 'outOfStock' flag based on stock
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      outOfStock: product.stock <= 0,
    }));

    res.json(formattedProducts);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});

// Admin protected: Stats
router.get('/stats', protect, adminOnly, async (req, res) => {
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

// Admin protected: Add new product with image upload
router.post(
  '/add-product',
  protect,
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description, price, category, stock } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!name || !price || !category || stock === undefined || stock === null || !image) {
        return res.status(400).json({ msg: 'All fields including image are required' });
      }

      // Ensure stock is valid and non-negative
      if (stock < 0) {
        return res.status(400).json({ msg: 'Stock cannot be negative' });
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
  }
);

// Admin protected: Delete product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete product' });
  }
});

// Admin protected: Update product (without image update for now)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Ensure stock is valid
    if (stock < 0) {
      return res.status(400).json({ msg: 'Stock cannot be negative' });
    }

    // Update product
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    await product.save();

    res.json({ msg: 'Product updated successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update product' });
  }
});

// Public: Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Add 'outOfStock' flag to the product
    res.json({
      ...product.toObject(),
      outOfStock: product.stock <= 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch product' });
  }
});

export default router;

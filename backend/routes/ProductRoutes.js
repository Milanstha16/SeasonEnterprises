import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';

const router = express.Router();

const allowedCategories = [
  'Bags',
  'Meditation',
  'Jewelry',
  'Clothing',
  'Home Decor',
  'Scarves',
  'Stones',
];

// =====================
// ✅ Cloudinary Config
// =====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================
// ✅ Multer + Cloudinary Storage
// =====================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// =====================
// Helper (Cloudinary gives full URL already)
// =====================
const buildImageUrl = (image) => image;

// =====================
// GET all products
// =====================
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const formatted = products.map((p) => ({
      ...p.toObject(),
      outOfStock: p.stock <= 0,
      imageUrl: buildImageUrl(p.image),
    }));

    res.json(formatted);
  } catch (err) {
    console.error('GET all products error:', err);
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});

// =====================
// GET single product by ID
// =====================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    res.json({
      ...product.toObject(),
      outOfStock: product.stock <= 0,
      imageUrl: buildImageUrl(product.image),
    });
  } catch (err) {
    console.error('GET product by ID error:', err);
    res.status(500).json({ msg: 'Failed to fetch product' });
  }
});

// =====================
// POST add product (Admin only)
// =====================
router.post('/add-product', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description = '', price, category, stock } = req.body;
    const image = req.file?.path; // ✅ Cloudinary URL

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (!name || !image || isNaN(parsedPrice) || isNaN(parsedStock) || !category) {
      return res.status(400).json({ msg: 'All fields are required and must be valid.' });
    }
    if (parsedPrice < 0 || parsedStock < 0) {
      return res.status(400).json({ msg: 'Price and stock must be non-negative numbers.' });
    }
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ msg: 'Invalid category.' });
    }

    const product = new Product({
      name,
      description,
      price: parsedPrice,
      stock: parsedStock,
      category,
      image,
    });

    await product.save();

    res.status(201).json({
      msg: 'Product added successfully',
      product,
    });
  } catch (err) {
    console.error('Error adding product:', err);
    if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Server error adding product' });
  }
});

// =====================
// PUT update product (Admin only)
// =====================
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description = '', price, stock, category } = req.body;
    const image = req.file?.path;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (!name || isNaN(parsedPrice) || isNaN(parsedStock) || !category) {
      return res.status(400).json({ msg: 'All fields are required and must be valid.' });
    }
    if (parsedPrice < 0 || parsedStock < 0) {
      return res.status(400).json({ msg: 'Price and stock must be non-negative.' });
    }
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ msg: 'Invalid category.' });
    }

    // ✅ If updating image, remove old one from Cloudinary
    if (image && product.image) {
      try {
        const urlParts = product.image.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        const publicId = `products/${fileName}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete old image error:', cloudErr.message);
      }
    }

    product.name = name;
    product.description = description;
    product.price = parsedPrice;
    product.stock = parsedStock;
    product.category = category;
    if (image) product.image = image;

    await product.save();

    res.json({
      msg: 'Product updated successfully',
      product,
    });
  } catch (err) {
    console.error('Error updating product:', err);
    if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Failed to update product' });
  }
});

// =====================
// DELETE product (Admin only)
// =====================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    // ✅ Delete image from Cloudinary
    if (product.image) {
      try {
        const urlParts = product.image.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        const publicId = `products/${fileName}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete image error:', cloudErr.message);
      }
    }

    await product.deleteOne();

    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Failed to delete product' });
  }
});

export default router;

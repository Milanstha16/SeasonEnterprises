import express from 'express';
import multer from 'multer';
import {
  addProduct,
  getProducts,
  deleteProduct,
  getProductById, // <-- Import the new controller
} from '../controllers/productController.js';

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post('/add', upload.single('image'), addProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);  // <-- New GET product by ID route
router.delete('/:id', deleteProduct);

export default router;

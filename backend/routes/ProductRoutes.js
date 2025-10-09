import express from 'express';
import multer from 'multer';
import { addProduct, getProducts, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post('/add', upload.single('image'), addProduct);
router.get('/', getProducts);
router.delete('/:id', deleteProduct); // <- Add this DELETE route

export default router;

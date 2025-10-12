import Product from '../models/Product.js';

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? req.file.filename : null;

    // Basic validation
    if (!name || !price || !category || stock === undefined || stock === null || !image) {
      return res.status(400).json({ error: 'All fields including image are required.' });
    }

    // Ensure stock is a valid number and greater than or equal to zero
    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update stock when a purchase happens
export const updateStockOnPurchase = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Product ID and quantity from the order

    // Validate input
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if enough stock is available
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Decrease the stock by the purchased quantity
    product.stock -= quantity;

    // Save the updated product
    await product.save();

    // Return success response
    res.json({ message: 'Stock updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import Product from '../models/Product.js';

const allowedCategories = ['Decor', 'Clothing', 'Jewelry', 'Books', 'Toys'];

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { name, description = '', price, category, stock } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !price || !category || stock === undefined || stock === null || !image) {
      return res.status(400).json({ error: 'All fields including image are required.' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Invalid stock' });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      stock: parsedStock,
      image,
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product added',
      product: {
        ...newProduct.toObject(),
        imageUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${newProduct.image}`,
      },
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Server error while adding product' });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const formatted = products.map(p => ({
      ...p.toObject(),
      imageUrl: p.image ? `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${p.image}` : null,
    }));

    res.json(formatted);
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

    res.json({
      ...product.toObject(),
      imageUrl: product.image ? `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${product.image}` : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const parsedPrice = price !== undefined ? parseFloat(price) : product.price;
    const parsedStock = stock !== undefined ? parseInt(stock, 10) : product.stock;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Invalid stock' });
    }

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (name && name.trim() !== '') {
      product.name = name.trim();
    }
    if (description) {
      product.description = description.trim();
    }
    product.price = parsedPrice;
    if (category) {
      product.category = category;
    }
    product.stock = parsedStock;

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    res.json({
      message: 'Product updated',
      product: {
        ...product.toObject(),
        imageUrl: product.image ? `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${product.image}` : null,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error while updating product' });
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
    const { productId, quantity } = req.body;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    const parsedQuantity = parseInt(quantity, 10);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    product.stock -= parsedQuantity;
    await product.save();

    res.json({ message: 'Stock updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

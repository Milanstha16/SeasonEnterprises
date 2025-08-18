// backend/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js"; // Correct model name & path

const router = express.Router();

// POST /product - Add a new product
router.post("/product", async (req, res) => {
  try {
    // Log incoming request body to debug if needed
    console.log("POST /product - req.body:", req.body);

    const { name, price } = req.body;

    // Validate input
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    // Create new product document
    const newProduct = new Product({ name, price });
    await newProduct.save();

    // Send response with created product
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err); // Log error for debugging
    res.status(500).json({ error: "Error adding product" });
  }
});

// GET /products - Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Error fetching products" });
  }
});

export default router;

// backend/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /product - Add a new product (protected route)
router.post("/product", authMiddleware, async (req, res) => {
  try {
    console.log("POST /product - req.body:", req.body);

    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const newProduct = new Product({ name, price });
    await newProduct.save();

    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Server error while adding product" });
  }
});

// GET /products - Get all products (public route)
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error while fetching products" });
  }
});

export default router;

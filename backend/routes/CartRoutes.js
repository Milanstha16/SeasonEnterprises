import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply the authentication middleware to all routes in this router
router.use(protect); // Ensures that all routes below require authentication

// Get the current user's cart
router.get("/", getCart);

// Add or update an item in the cart
router.post("/", addToCart);

// Remove an item from the cart
router.delete("/:productId", removeFromCart);

// Clear all items from the cart (using DELETE for clarity)
router.delete("/clear", clearCart);

export default router;

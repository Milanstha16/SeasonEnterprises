import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(protect);

// Routes
router.get("/", getCart);            // GET /api/cart
router.post("/", addToCart);         // POST /api/cart
router.delete("/clear", clearCart);  // DELETE /api/cart/clear ✅ placed before :productId
router.delete("/:productId", removeFromCart); // DELETE /api/cart/:productId

export default router;

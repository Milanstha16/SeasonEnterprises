import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // ✅ use the correct middleware name

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/:productId", removeFromCart);
router.post("/clear", clearCart);

export default router;

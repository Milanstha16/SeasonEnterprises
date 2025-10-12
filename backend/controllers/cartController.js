import Cart from "../models/Cart.js";
import Product from "../models/Product.js"; // Import Product model

// Get the current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image", // ✅ Ensure image and other needed fields are populated
    });

    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add or update item in cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ msg: "Invalid product or quantity" });
  }

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Update quantity of existing product in cart
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Add new product to cart
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Re-fetch the updated cart with populated product data
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    res.json(updatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    res.json(updatedCart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Clear all items from the cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ msg: "Cart cleared", cart: { items: [] } });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

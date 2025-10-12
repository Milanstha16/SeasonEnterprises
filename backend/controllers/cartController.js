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

    // Recalculate the total price for the cart
    const totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );

    res.json({ ...cart.toObject(), totalPrice }); // Include the total price in the response
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

    // Find the user's cart
    let cart = await Cart.findOne({ userId: req.user.id });

    // If no cart, create a new one
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if the item is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Update the quantity of the existing product
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Add a new item to the cart
      cart.items.push({ productId, quantity });
    }

    // Save the cart
    await cart.save();

    // Recalculate the total price
    const totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );

    // Return the updated cart with the total price
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    res.json({ ...updatedCart.toObject(), totalPrice });
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

    // Find the user's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    // Remove the item from the cart
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    // Recalculate the total price
    const totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );

    // Return the updated cart with the total price
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    res.json({ ...updatedCart.toObject(), totalPrice });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Clear all items from the cart
export const clearCart = async (req, res) => {
  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    // Clear all items from the cart
    cart.items = [];
    await cart.save();

    // Return a success message and empty cart
    res.json({ msg: "Cart cleared", cart: { items: [], totalPrice: 0 } });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

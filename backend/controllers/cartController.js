import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Get the current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    if (!cart) return res.json({ items: [], totalPrice: 0 });

    // ✅ Filter out items with missing (deleted) product references
    const filteredItems = cart.items.filter(item => item.productId);

    // ✅ Recalculate total
    const totalPrice = filteredItems.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );

    // ✅ Return cleaned response matching frontend expectations
    const responseItems = filteredItems.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity,
    }));

    res.json({ items: responseItems, totalPrice });
  } catch (err) {
    console.error("Error fetching cart:", err.message, err.stack);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add or update item in cart
export const addToCart = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Invalid cart data" });
  }

  try {
    // Ensure all products exist
    const validItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        validItems.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: validItems });
    } else {
      // Replace the entire cart with the new items
      cart.items = validItems;
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image",
    });

    const filteredItems = updatedCart.items.filter(item => item.productId);

    const totalPrice = filteredItems.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );

    const responseItems = filteredItems.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity,
    }));

    res.json({ items: responseItems, totalPrice });
  } catch (err) {
    console.error("Error syncing cart:", err.message, err.stack);
    res.status(500).json({ msg: "Server error" });
  }
};

// Remove item from cart (optional route)
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error("Error removing item:", err.message, err.stack);
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

    res.json({ msg: "Cart cleared", items: [], totalPrice: 0 });
  } catch (err) {
    console.error("Error clearing cart:", err.message, err.stack);
    res.status(500).json({ msg: "Server error" });
  }
};

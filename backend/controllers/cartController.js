import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper: build full image URL
const buildImageUrl = (imagePath) => {
  if (!imagePath) return "/default-image.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.BASE_URL}/uploads/${imagePath}`;
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image stockAvailable",
    });

    if (!cart) return res.json({ items: [], totalPrice: 0 });

    const filteredItems = cart.items.filter(item => item.productId);

    const responseItems = filteredItems.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      price: item.price,
      image: buildImageUrl(item.productId.image),
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      stockAvailable: item.productId.stockAvailable,
    }));

    res.json({ items: responseItems, totalPrice: cart.totalPrice });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// POST /api/cart
export const addToCart = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ msg: "Invalid cart data" });

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    // Map valid items with stock check
    const validItems = [];
    for (const item of items) {
      if (!item.productId) continue;

      const product = await Product.findById(item.productId);
      if (!product) continue;

      const quantity = Math.min(item.quantity || 1, product.stockAvailable);
      validItems.push({
        productId: product._id,
        quantity,
        price: product.price,
        totalPrice: product.price * quantity,
        variant: item.variant || undefined,
      });
    }

    if (validItems.length === 0) return res.status(400).json({ msg: "No valid items" });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: validItems });
    } else {
      // Replace cart items with new array
      cart.items = validItems;
    }

    await cart.save();

    // Populate for frontend
    const populatedCart = await cart.populate({
      path: "items.productId",
      select: "name price image stockAvailable",
    });

    const responseItems = populatedCart.items.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      price: item.price,
      image: buildImageUrl(item.productId.image),
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      stockAvailable: item.productId.stockAvailable,
    }));

    res.json({ items: responseItems, totalPrice: populatedCart.totalPrice });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.json({ msg: "Item removed", items: cart.items, totalPrice: cart.totalPrice });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ msg: "Cart cleared", items: [], totalPrice: 0 });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

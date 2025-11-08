import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Utility to build full image URL
const buildImageUrl = (imagePath) => {
  if (!imagePath) return "/default-image.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("uploads")) return `${process.env.BASE_URL}/${imagePath}`;
  return `${process.env.BASE_URL}/uploads/${imagePath}`;
};

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.productId",
      select: "name price image stockAvailable",
    });

    if (!cart) return res.json({ items: [], totalPrice: 0 });

    const responseItems = cart.items
      .filter(item => item.productId)
      .map(item => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.price,
        image: buildImageUrl(item.productId.image),
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        stockAvailable: item.productId.stockAvailable,
        variant: item.variant,
      }));

    res.json({ items: responseItems, totalPrice: cart.totalPrice });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add or update items in cart
export const addToCart = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Invalid cart data" });
  }

  try {
    // Validate and map items
    const validItems = [];
    for (const item of items) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const quantity = Math.max(1, item.quantity || 1);
      const price = product.price;

      validItems.push({
        productId: item.productId,
        quantity,
        price,
        totalPrice: price * quantity,
        variant: item.variant || undefined,
      });
    }

    if (validItems.length === 0) {
      return res.status(400).json({ msg: "No valid items found" });
    }

    // Upsert cart (create or update)
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: validItems });
    } else {
      cart.items = validItems;
    }

    await cart.save();

    // Return updated cart
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
      variant: item.variant,
    }));

    res.json({ items: responseItems, totalPrice: populatedCart.totalPrice });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Clear cart
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

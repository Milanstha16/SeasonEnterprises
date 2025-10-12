import Order from "../models/Order.js";
import Stripe from 'stripe';
const stripe = Stripe('your-stripe-secret-key');

// Utility function to calculate total amount
const calculateTotalAmount = (items) => {
  return items.reduce(
    (total, item) => total + item.priceAtPurchase * item.quantity,
    0
  );
};

// Utility function to validate items (checking for required fields like name, price, quantity)
const validateItems = (items) => {
  items.forEach(item => {
    if (!item.name || typeof item.name !== 'string') {
      throw new Error('Each item must have a valid "name" field.');
    }
    if (!item.priceAtPurchase || typeof item.priceAtPurchase !== 'number') {
      throw new Error('Each item must have a valid "priceAtPurchase" field.');
    }
    if (!item.quantity || typeof item.quantity !== 'number') {
      throw new Error('Each item must have a valid "quantity" field.');
    }
  });
};

// Create a new order (generic function, can be used for both Stripe/PayPal)
export const createOrder = async (req, res) => {
  try {
    const { userId, items, shipping, paymentMethod, transactionId } = req.body;

    // Validate input data
    if (!userId || !items || !shipping || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate each item in the order
    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Check for valid shipping data
    if (!shipping || !shipping.address || !shipping.city || !shipping.zipCode) {
      return res.status(400).json({ message: "Incomplete shipping information" });
    }

    const totalAmount = calculateTotalAmount(items);

    // Validate Stripe transactionId (for Stripe payments only)
    if (paymentMethod === "stripe" && !transactionId) {
      return res.status(400).json({ message: "Transaction ID is required for Stripe payments" });
    }

    if (paymentMethod === "stripe") {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ message: "Payment not successful" });
        }
      } catch (error) {
        console.error("Stripe payment validation failed:", error);
        return res.status(400).json({ message: "Invalid transaction ID or Stripe payment failed" });
      }
    }

    // Create the new order
    const newOrder = new Order({
      userId,
      items,
      shipping,
      paymentMethod,
      transactionId,
      totalAmount,
      paymentStatus: "pending", // Default to pending until payment is confirmed
      status: "pending", // Default status
    });

    // Set the payment date for PayPal/Stripe
    if (paymentMethod === "paypal" || paymentMethod === "stripe") {
      newOrder.paymentDate = new Date();
    }

    // Save the order to the database
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Mark order as paid
export const markPaid = async (req, res) => {
  const { orderId, transactionId } = req.body;
  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order is still pending
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Order is already processed" });
    }

    // Mark the order as paid
    order.paymentStatus = "paid";
    order.transactionId = transactionId;
    order.paymentDate = new Date();

    // Save the updated order
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Error marking order as paid:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Create a new order for Stripe payments
export const createOrderWithStripe = async (req, res) => {
  try {
    return createOrder(req, res);  // Reuse the generic `createOrder` function for Stripe
  } catch (error) {
    console.error("Error creating order with Stripe:", error.message || error);
    res.status(500).json({ message: error.message || "Error processing Stripe payment" });
  }
};

// Create a new order for PayPal payments
export const createOrderWithPaypal = async (req, res) => {
  try {
    return createOrder(req, res);  // Reuse the generic `createOrder` function for PayPal
  } catch (error) {
    console.error("Error creating order with PayPal:", error.message || error);
    res.status(500).json({ message: error.message || "Error processing PayPal payment" });
  }
};

// Get a single order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")  // Populate user details
      .populate("items.productId"); // Populate product details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Get orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 }); // Sort orders by creation date, newest first

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Update order status (e.g., shipped, delivered)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Set shipping date if status is "shipped"
    if (status === "shipped" && !order.shippingDate) {
      order.shippingDate = new Date();
    } else if (status === "shipped" && order.shippingDate) {
      // Prevent overwriting the shipping date if it's already set
      return res.status(400).json({ message: "Shipping date already set" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

import Order from "../models/Order.js";
import Stripe from 'stripe';
const stripe = Stripe('sk_test_51SH7TZCnCfQ1XzuSUwhpzMGUlA2XQxIrF10HHXGq8PyeCG6Fjp6QF7mRqWfndJgA3fyEbxuwoFtlpjyCyNU617EW00ACX0eS06'); // Replace with your actual Stripe secret key

// Utility function to calculate total amount in cents
const calculateTotalAmount = (items) => {
  return items.reduce(
    (total, item) => total + item.priceAtPurchase * item.quantity,
    0
  );
};

// Utility function to validate items
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

// Create Stripe PaymentIntent - to be called by frontend before order creation
export const createPaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items for payment" });
    }

    validateItems(items);

    const amount = Math.round(calculateTotalAmount(items) * 100); // amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Payment intent creation failed" });
  }
};

// Create a new order after payment is confirmed
export const createOrder = async (req, res) => {
  try {
    const { userId, items, shipping, paymentMethod, transactionId } = req.body;

    // Validate input data
    if (!userId || !items || !shipping || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate each item
    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Shipping info validation - make sure to use postalCode
    if (
      !shipping.address ||
      !shipping.city ||
      !shipping.postalCode // changed from zipCode to postalCode to match frontend
    ) {
      return res.status(400).json({ message: "Incomplete shipping information" });
    }

    const totalAmount = calculateTotalAmount(items);

    // Validate Stripe transactionId if payment method is stripe
    if (paymentMethod === "stripe") {
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required for Stripe payments" });
      }
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

    // Create the order
    const newOrder = new Order({
      userId,
      items,
      shipping,
      paymentMethod,
      transactionId,
      totalAmount,
      paymentStatus: paymentMethod === "stripe" ? "paid" : "pending", // Mark paid if Stripe payment succeeded
      status: "pending",
    });

    if (paymentMethod === "paypal" || paymentMethod === "stripe") {
      newOrder.paymentDate = new Date();
    }

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

  } catch (error) {
    console.error("Error creating order:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Mark order as paid (optional if you want to update payment status later)
export const markPaid = async (req, res) => {
  const { orderId, transactionId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Order is already processed" });
    }

    order.paymentStatus = "paid";
    order.transactionId = transactionId;
    order.paymentDate = new Date();

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Error marking order as paid:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Other endpoints (getOrder, getAllOrders, getUserOrders, updateOrderStatus) remain the same as before

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "shipped" && !order.shippingDate) {
      order.shippingDate = new Date();
    } else if (status === "shipped" && order.shippingDate) {
      return res.status(400).json({ message: "Shipping date already set" });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error.message || error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

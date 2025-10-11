import Order from "../models/Order.js"; // Order model import

export const createOrder = async (req, res) => {
  try {
    console.log(req.body); // Log incoming data for debugging

    const { userId, items, shipping, paymentMethod, transactionId } = req.body;

    // Check for missing required fields
    if (!userId || !items || !shipping || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate the total amount
    const totalAmount = items.reduce((total, item) => total + item.priceAtPurchase * item.quantity, 0);

    // Create a new order document
    const newOrder = new Order({
      userId,
      items,
      shipping,
      paymentMethod,
      transactionId,
      totalAmount,
      paymentStatus: "pending",
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markPaid = async (req, res) => {
  const { orderId, transactionId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the payment is only marked if the order is in pending state
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Order is already processed" });
    }

    // Update order payment status and transaction ID
    order.paymentStatus = "paid";
    order.transactionId = transactionId;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error marking order as paid:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

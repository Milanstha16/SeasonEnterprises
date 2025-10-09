import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-intent
router.post("/payment/create-intent", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

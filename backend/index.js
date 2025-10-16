import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import ProductRoutes from "./routes/ProductRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import ContactRoutes from "./routes/ContactRoutes.js";
import CartRoutes from "./routes/CartRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";

// Stripe & PayPal
import stripe from "stripe";
import paypal from "paypal-rest-sdk";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === "http://localhost:8080" ||  // Allow frontend dev
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)  // Local IP
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/products", ProductRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/contact", ContactRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/payment/stripe", PaymentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// MongoDB connection with logging
mongoose
  .connect(process.env.MONGODB_URI)
  .then((conn) => {
    console.log(`✅ MongoDB connected to database: ${conn.connection.name}`);
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Stripe check
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing in environment");
  process.exit(1);
}

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// PayPal config
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
  console.error("❌ PayPal credentials not found in environment");
  process.exit(1);
}

paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Stripe example endpoint
app.post("/api/payment/stripe", async (req, res) => {
  const { amount, currency = "usd", items } = req.body;

  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map(item => ({
        price_data: {
          currency,
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe payment error:", error);
    res.status(500).json({ error: error.message || "Stripe error" });
  }
});

// PayPal example endpoint
app.post("/api/payment/paypal", (req, res) => {
  const { amount, currency = "USD", items } = req.body;

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    transactions: [{
      amount: {
        currency,
        total: amount.toString(),
      },
      description: "Your order description",
      item_list: {
        items: items.map(item => ({
          name: item.name,
          price: item.price.toString(),
          currency,
          quantity: item.quantity,
        })),
      },
    }],
    redirect_urls: {
      return_url: `${process.env.FRONTEND_URL}/paypal-success`,
      cancel_url: `${process.env.FRONTEND_URL}/paypal-cancel`,
    },
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.error("PayPal error:", error);
      res.status(500).json({ error: "PayPal payment creation failed" });
    } else {
      const approvalUrl = payment.links.find(link => link.rel === "approval_url")?.href;
      res.json({ approvalUrl });
    }
  });
});

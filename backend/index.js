import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

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
import Stripe from "stripe";
import paypal from "paypal-rest-sdk";

// Load environment variables
dotenv.config();

// Automatically set FRONTEND_URL if missing
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

if (!process.env.FRONTEND_URL) {
  const localIp = getLocalIpAddress();
  process.env.FRONTEND_URL = `http://${localIp}:8080`;
  console.log(`⚠️ FRONTEND_URL not set in .env, defaulting to ${process.env.FRONTEND_URL}`);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup
app.use(cors({
  origin: (origin, callback) => {
    try {
      if (
        !origin ||
        origin === "http://localhost:8080" || // frontend dev URL
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) // local IPs with port
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    } catch (err) {
      callback(err);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Middleware to parse JSON and serve static uploads
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

// Simple test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Critical environment checks before starting services
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in environment");
  process.exit(1);
}
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing in environment");
  process.exit(1);
}
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
  console.error("❌ PayPal credentials missing in environment");
  process.exit(1);
}
// Removed the exit on missing FRONTEND_URL since it’s now set automatically

// Initialize Stripe and PayPal after env checks
const stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);

paypal.configure({
  mode: "sandbox", // change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
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

// Stripe payment endpoint
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
          unit_amount: Math.round(item.price * 100), // Stripe expects integer cents
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

// PayPal payment endpoint
app.post("/api/payment/paypal", (req, res) => {
  const { amount, currency = "USD", items } = req.body;

  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
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

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error("PayPal error:", error);
      return res.status(500).json({ error: "PayPal payment creation failed" });
    }
    const approvalUrl = payment.links.find(link => link.rel === "approval_url")?.href;
    res.json({ approvalUrl });
  });
});

// Global error handler (including multer errors etc)
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  if (err.name === "MulterError" || err.message === "Only image files are allowed") {
    return res.status(400).json({ msg: err.message });
  }
  res.status(err.status || 500).json({ msg: err.message || "Internal Server Error" });
});

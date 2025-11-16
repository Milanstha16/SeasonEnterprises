import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// CORS setup
// --------------------
const FRONTEND_URLS = (process.env.FRONTEND_URLS || "http://localhost:8080,https://season-enterprises.vercel.app")
  .split(",")
  .map(url => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || FRONTEND_URLS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// --------------------
// Middleware
// --------------------
app.use(express.json());

// --------------------
// Routes
// --------------------
app.use("/api/products", ProductRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/contact", ContactRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/payment", PaymentRoutes);

// Test route
app.get("/", (req, res) => res.send("API is running!"));

// --------------------
// Environment checks
// --------------------
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) throw new Error("PayPal credentials missing");

// --------------------
// Initialize Stripe & PayPal
// --------------------
const stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET
});

// --------------------
// MongoDB Connection & Server Start
// --------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({ msg: err.message || "Internal Server Error" });
});

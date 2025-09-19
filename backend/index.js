// Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ProductRoutes from './routes/ProductRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';

// Initialize dotenv to read environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:8080',  // Allow requests only from the frontend at localhost:8080
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json()); // Parse JSON request bodies

// Test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// ✅ Use product and auth routes
app.use("/api", ProductRoutes);
app.use("/api/auth", AuthRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

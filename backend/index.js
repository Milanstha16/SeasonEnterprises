// index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ProductRoutes from './routes/ProductRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS config allowing frontend origins
app.use(
  cors({
    origin: ['http://localhost:8080', 'http://192.168.101.2:8080'], // your frontend origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware to parse JSON request body
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Mount routes
app.use("/api", ProductRoutes);
app.use("/api/auth", AuthRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

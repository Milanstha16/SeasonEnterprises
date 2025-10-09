import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Route imports
import ProductRoutes from "./routes/ProductRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === "http://localhost:8080" ||
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Serve uploaded images from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/products", ProductRoutes); // ✅ FIXED: mounts correctly
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

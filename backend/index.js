import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ProductRoutes from "./routes/ProductRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");

// ✅ Updated CORS config to support dynamic IPs (e.g. 192.168.x.x)
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin || // allow non-browser clients like Postman
      origin === "http://localhost:8080" || // allow localhost
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) // allow any 192.168.x.x:port
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

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api", ProductRoutes);
app.use("/api/auth", AuthRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

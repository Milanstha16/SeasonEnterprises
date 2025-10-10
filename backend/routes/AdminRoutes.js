import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and is admin
    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and user info
    res.json({
      token,
      expiresIn: 86400, // seconds (1 day)
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get total users count
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get recent 5 users (without password)
router.get("/recent-users", async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");
    res.json(recentUsers);
  } catch (error) {
    console.error("Error fetching recent users:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get dummy recent activity data
router.get("/recent-activity", (req, res) => {
  try {
    const dummyActivity = [
      { id: 1, action: "User John logged in", timestamp: new Date() },
      { id: 2, action: "User Jane updated profile", timestamp: new Date() },
      { id: 3, action: "User Mike created a post", timestamp: new Date() },
    ];
    res.json(dummyActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

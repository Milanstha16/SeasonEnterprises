// backend/routes/AuthRoutes.js
import express from "express";
import User from "../models/User.js"; // Your User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Please provide email and password" });

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and user info
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

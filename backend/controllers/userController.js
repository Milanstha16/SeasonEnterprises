import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

/* -------------------------- Get All Users -------------------------- */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
    const limit = Math.min(100, parseInt(req.query.limit, 10)) || 20;
    const role = req.query.role;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({ page, limit, total, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/* -------------------------- Create User -------------------------- */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

/* -------------------------- Login User -------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------- Get User by ID -------------------------- */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------- Update User -------------------------- */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updateData = { name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------- Upload Profile Picture -------------------------- */
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Not authorized" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = req.user.id;
    const filename = req.file.filename;
    const uploadDir = path.join("Profiles");

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete old profile picture if exists and not default
    if (user.profilePicture && !user.profilePicture.includes("default-avatar.jpg")) {
      try {
        const oldFile = path.basename(user.profilePicture);
        const oldPath = path.join(uploadDir, oldFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn("⚠️ Failed to delete old profile picture:", err.message);
      }
    }

    // Save full URL in DB
    const imageUrl = `${req.protocol}://${req.get("host")}/Profiles/${filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: imageUrl,
      user: userObj,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Server error" });
  }
};

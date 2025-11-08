import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid"; // To generate unique file names
import { promises as fsPromises } from 'fs'; // Async fs operations

// Directory where profile pictures are stored
const uploadDir = path.join("Profiles");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

    const freshUser = await User.findById(user._id).select("-password");

    res.status(200).json({ user: freshUser });
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
    const { name, email, role, password, profilePicture } = req.body;

    const updateData = { name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    } else {
      const existingUser = await User.findById(id);
      if (existingUser) {
        updateData.profilePicture = existingUser.profilePicture;
      }
    }

    // Filter out any undefined or null values
    Object.keys(updateData).forEach(key => (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]);

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
    const filename = uuidv4() + path.extname(req.file.originalname); // Use UUID to prevent file name collisions
    const uploadPath = path.join(uploadDir, filename);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate file type (optional: here we allow only images)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type. Only images are allowed." });
    }

    // Delete old profile picture if not default
    if (user.profilePicture && !user.profilePicture.includes("default-avatar.jpg")) {
      try {
        const oldFileName = path.basename(user.profilePicture);  // Extract the file name
        const oldFilePath = path.join(uploadDir, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          await fsPromises.unlink(oldFilePath); // Delete old file asynchronously
        }
      } catch (err) {
        console.warn("⚠️ Failed to delete old profile picture:", err.message);
      }
    }

    // Save the new profile picture URL in the database
    const imageUrl = `${req.protocol}://${req.get("host")}/Profiles/${filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    // Return the updated user object without password
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

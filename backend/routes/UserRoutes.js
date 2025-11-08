import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------- Profiles Upload Directory -------------------
const uploadDir = path.join("Profiles");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ------------------- Multer Storage & Filter -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only images (JPEG, PNG, GIF, WebP) are allowed"));
    }
    cb(null, true);
  },
});

// ------------------- GET All Users (Admin Only) -------------------
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ------------------- GET Single User -------------------
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ------------------- UPDATE Profile (Name/Email/Password) -------------------
router.patch("/update", protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select("-password");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ------------------- PATCH Profile Picture -------------------
router.patch(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Delete old profile picture if not default
      if (user.profilePicture && !user.profilePicture.includes("default-avatar.jpg")) {
        const oldFile = path.join(uploadDir, path.basename(user.profilePicture));
        fs.promises.unlink(oldFile).catch(err => {
          console.warn("⚠️ Failed to delete old profile picture:", err.message);
        });
      }

      // Store ONLY filename in DB
      user.profilePicture = req.file.filename;
      await user.save();

      const updatedUser = await User.findById(user._id).select("-password");

      res.json({ message: "Profile picture updated successfully", user: updatedUser });
    } catch (err) {
      console.error("Error updating profile picture:", err);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  }
);

// ------------------- DELETE User (Admin Only) -------------------
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.profilePicture && !user.profilePicture.includes("default-avatar.jpg")) {
      const oldFile = path.join(uploadDir, path.basename(user.profilePicture));
      fs.promises.unlink(oldFile).catch(err => {
        console.warn("⚠️ Failed to delete profile picture:", err.message);
      });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});

export default router;

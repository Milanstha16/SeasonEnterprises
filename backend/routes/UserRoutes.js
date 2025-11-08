import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                              📁 Multer Setup                               */
/* -------------------------------------------------------------------------- */

const uploadDir = path.join("Profiles");

// Ensure the Profiles folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created Profiles folder");
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

/* -------------------------------------------------------------------------- */
/*                             👥 User Endpoints                              */
/* -------------------------------------------------------------------------- */

// GET all users (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET user by ID (protected)
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

/* -------------------------------------------------------------------------- */
/*                   🖼️ PATCH - Upload or Update Profile Picture              */
/* -------------------------------------------------------------------------- */
router.patch(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Delete old profile picture if exists and not default
      if (
        user.profilePicture &&
        !user.profilePicture.includes("default-avatar.jpg")
      ) {
        try {
          const oldFilename = path.basename(user.profilePicture);
          const oldPath = path.join(uploadDir, oldFilename);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn("⚠️ Failed to delete old profile:", err.message);
        }
      }

      const imageUrl = `${req.protocol}://${req.get("host")}/Profiles/${req.file.filename}`;
      user.profilePicture = imageUrl;
      await user.save();

      console.log(`✅ User ${user.id} updated profile picture: ${req.file.filename}`);

      res.json({
        message: "Profile picture updated successfully",
        profilePicture: imageUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: imageUrl,
        },
      });
    } catch (err) {
      console.error("Error updating profile picture:", err);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                           ❌ DELETE User (Admin)                            */
/* -------------------------------------------------------------------------- */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete profile picture if exists
    if (
      user.profilePicture &&
      !user.profilePicture.includes("default-avatar.jpg")
    ) {
      const oldFilename = path.basename(user.profilePicture);
      const oldPath = path.join(uploadDir, oldFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});

export default router;

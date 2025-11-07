import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup for storing files locally in /Profiles folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Profiles/'); // Ensure this folder exists in your project root
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

// GET all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID (protected, user or admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH - Update profile picture (authenticated user only)
router.patch('/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete old profile picture if it exists and is not default
    if (user.profilePicture && !user.profilePicture.includes('default-avatar.jpg')) {
      const oldFilePath = path.join('Profiles', user.profilePicture);
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.warn('Failed to delete old profile picture:', err.message);
        } else {
          console.log('Deleted old profile picture:', oldFilePath);
        }
      });
    }

  user.profilePicture = req.file.filename;
    await user.save();

    console.log(`User ${user.id} updated profile picture: ${req.file.filename}`);
    res.json({ message: 'Profile picture updated', profilePicture: req.file.filename });
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// DELETE user by ID (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

export default router;

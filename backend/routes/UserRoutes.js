import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

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

    if (
      req.user.role !== 'admin' &&
      req.user.id !== req.params.id // decoded JWT user id (string)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// DELETE user by ID (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deleteOne();  // use deleteOne() instead of deprecated remove()
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

export default router;

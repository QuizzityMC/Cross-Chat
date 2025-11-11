const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all users (search)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { _id: { $ne: req.userId } };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, about, avatar } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (displayName) user.displayName = displayName;
    if (about !== undefined) user.about = about;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      about: user.about,
      status: user.status
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

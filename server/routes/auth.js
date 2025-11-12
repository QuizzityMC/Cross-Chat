const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimiter');
const { DEMO_USERS } = require('../utils/initDemoData');

const router = express.Router();

// Register
router.post('/register', authLimiter, [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      displayName
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        about: user.about
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user - Mongoose automatically sanitizes query parameters to prevent injection
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update status
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        about: user.about,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Demo login - Get list of demo accounts
router.get('/demo-accounts', async (req, res) => {
  try {
    const demoAccounts = DEMO_USERS.map(user => ({
      email: user.email,
      displayName: user.displayName,
      about: user.about
    }));
    res.json({ demoAccounts });
  } catch (error) {
    console.error('Demo accounts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Demo login - Auto-login as demo user
router.post('/demo-login', authLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Verify it's a demo account - this prevents injection attacks
    // by ensuring only whitelisted email addresses can be used
    const isDemoAccount = DEMO_USERS.some(demo => demo.email === email);
    if (!isDemoAccount) {
      return res.status(400).json({ error: 'Invalid demo account' });
    }

    // Find user - email is validated against whitelist above, preventing injection
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Demo account not found. Please restart the server to initialize demo data.' });
    }

    // Update status
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        about: user.about,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

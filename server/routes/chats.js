const express = require('express');
const authMiddleware = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Get all chats for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate('admin', '-password')
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get one-on-one chat
router.post('/direct', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.userId, userId], $size: 2 }
    }).populate('participants', '-password');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = new Chat({
      participants: [req.userId, userId],
      isGroup: false
    });

    await chat.save();
    await chat.populate('participants', '-password');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group chat
router.post('/group', authMiddleware, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({ error: 'Group name and at least 2 participants required' });
    }

    const chat = new Chat({
      participants: [req.userId, ...participants],
      isGroup: true,
      groupName: name,
      admin: req.userId
    });

    await chat.save();
    await chat.populate('participants', '-password');
    await chat.populate('admin', '-password');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chat by ID
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.userId
    })
      .populate('participants', '-password')
      .populate('admin', '-password');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

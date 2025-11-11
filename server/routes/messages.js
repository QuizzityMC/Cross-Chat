const express = require('express');
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    let query = { chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', '-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.post('/:chatId/read', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        chatId,
        sender: { $ne: req.userId }
      },
      {
        $addToSet: {
          readBy: {
            user: req.userId,
            readAt: new Date()
          }
        },
        status: 'read'
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

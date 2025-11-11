const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const socketHandler = (io) => {
  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Update user status to online
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      lastSeen: new Date()
    });

    // Join user's chat rooms
    const userChats = await Chat.find({ participants: socket.userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Broadcast user online status
    io.emit('user:status', { userId: socket.userId, status: 'online' });

    // Handle typing indicator
    socket.on('typing:start', ({ chatId }) => {
      socket.to(chatId).emit('typing:start', {
        chatId,
        userId: socket.userId
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(chatId).emit('typing:stop', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType = 'text', mediaUrl = '' } = data;

        // Verify user is in chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Create message
        const message = new Message({
          chatId,
          sender: socket.userId,
          content,
          messageType,
          mediaUrl,
          status: 'sent'
        });

        await message.save();
        await message.populate('sender', '-password');

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit to all participants in the chat
        io.to(chatId).emit('message:new', message);

        // Send delivery confirmation
        socket.emit('message:sent', { 
          tempId: data.tempId,
          messageId: message._id 
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message status updates
    socket.on('message:delivered', async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: 'delivered' },
          { new: true }
        );

        if (message) {
          io.to(message.chatId.toString()).emit('message:status', {
            messageId,
            status: 'delivered'
          });
        }
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    socket.on('message:read', async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            status: 'read',
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          },
          { new: true }
        );

        if (message) {
          io.to(message.chatId.toString()).emit('message:status', {
            messageId,
            status: 'read',
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error updating message read status:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      // Broadcast user offline status
      io.emit('user:status', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });
};

module.exports = socketHandler;

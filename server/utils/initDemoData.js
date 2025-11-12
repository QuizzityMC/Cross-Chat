const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const DEMO_USERS = [
  {
    username: 'demo1',
    email: 'demo1@crosschat.demo',
    password: 'demo123',
    displayName: 'Alice Demo',
    about: 'Demo user - Feel free to chat!',
    avatar: ''
  },
  {
    username: 'demo2',
    email: 'demo2@crosschat.demo',
    password: 'demo123',
    displayName: 'Bob Demo',
    about: 'Demo user - Testing the app!',
    avatar: ''
  },
  {
    username: 'demo3',
    email: 'demo3@crosschat.demo',
    password: 'demo123',
    displayName: 'Charlie Demo',
    about: 'Demo user - Hello world!',
    avatar: ''
  }
];

async function initDemoData() {
  try {
    // Check if demo users already exist
    const existingDemo = await User.findOne({ email: 'demo1@crosschat.demo' });
    if (existingDemo) {
      console.log('Demo data already initialized');
      return;
    }

    console.log('Initializing demo data...');

    // Create demo users
    const createdUsers = [];
    for (const demoUser of DEMO_USERS) {
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      const user = new User({
        ...demoUser,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created demo user: ${demoUser.displayName}`);
    }

    // Create a demo group chat
    const demoChat = new Chat({
      participants: createdUsers.map(u => u._id),
      isGroup: true,
      groupName: 'Demo Group Chat',
      groupAvatar: '',
      admin: createdUsers[0]._id
    });
    await demoChat.save();
    console.log('Created demo group chat');

    // Create welcome messages
    const welcomeMessages = [
      {
        chat: demoChat._id,
        sender: createdUsers[0]._id,
        content: 'Welcome to Cross-Chat! This is a demo group chat.',
        messageType: 'text'
      },
      {
        chat: demoChat._id,
        sender: createdUsers[1]._id,
        content: 'Feel free to explore the app and send messages!',
        messageType: 'text'
      },
      {
        chat: demoChat._id,
        sender: createdUsers[2]._id,
        content: 'You can also create your own account to chat with real users.',
        messageType: 'text'
      }
    ];

    for (const msgData of welcomeMessages) {
      const message = new Message(msgData);
      await message.save();
    }

    // Update last message in chat
    const lastMessage = await Message.findOne({ chat: demoChat._id }).sort({ createdAt: -1 });
    demoChat.lastMessage = lastMessage._id;
    demoChat.lastMessageAt = lastMessage.createdAt;
    await demoChat.save();

    console.log('Demo data initialization complete!');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

module.exports = { initDemoData, DEMO_USERS };

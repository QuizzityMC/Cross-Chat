import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import './Chat.css';

let socket = null;

const Chat = () => {
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    // In production, connect to same origin (nginx proxies /socket.io)
    // In development, connect to backend server directly
    const socketUrl = import.meta.env.DEV ? 'http://localhost:3000' : undefined;
    socket = io(socketUrl, {
      auth: { token },
      path: '/socket.io'
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('message:new', (message) => {
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update chat list
      loadChats();
    });

    socket.on('user:status', ({ userId, status, lastSeen }) => {
      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          participants: chat.participants.map((p) =>
            p._id === userId ? { ...p, status, lastSeen } : p
          )
        }))
      );
      
      // Also update selected chat if it contains this user
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p._id === userId ? { ...p, status, lastSeen } : p
          )
        };
      });
    });

    loadChats();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chats');
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = (content, messageType = 'text', mediaUrl = '') => {
    if (!selectedChat || !content.trim()) return;

    const tempId = Date.now();
    socket.emit('message:send', {
      chatId: selectedChat._id,
      content,
      messageType,
      mediaUrl,
      tempId
    });
  };

  return (
    <div className="chat-container">
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={loadChats}
        currentUser={user}
        loading={loading}
      />
      <ChatWindow
        chat={selectedChat}
        messages={messages}
        currentUser={user}
        onSendMessage={sendMessage}
        socket={socket}
      />
    </div>
  );
};

export default Chat;

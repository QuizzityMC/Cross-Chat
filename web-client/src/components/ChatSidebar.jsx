import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, selectedChat, onSelectChat, onNewChat, currentUser, loading }) => {
  const { logout } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await axios.get(`/api/users?search=${query}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setUsers([]);
    }
  };

  const startChat = async (userId) => {
    try {
      const response = await axios.post('/api/chats/direct', { userId });
      onSelectChat(response.data);
      setShowNewChat(false);
      setSearchQuery('');
      setUsers([]);
      onNewChat();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroup) {
      return chat.groupName;
    }
    const otherUser = chat.participants?.find((p) => p._id !== currentUser?.id);
    return otherUser?.displayName || 'Unknown';
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroup) {
      return chat.groupAvatar || '👥';
    }
    const otherUser = chat.participants?.find((p) => p._id !== currentUser?.id);
    return otherUser?.avatar || '👤';
  };

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">{currentUser?.avatar || '👤'}</div>
          <span className="user-name">{currentUser?.displayName}</span>
        </div>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setShowNewChat(!showNewChat)} title="New chat">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
            </svg>
          </button>
          <button className="icon-button" onClick={() => setShowMenu(!showMenu)} title="Menu">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
            </svg>
          </button>
        </div>
        {showMenu && (
          <div className="dropdown-menu">
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>

      {/* New Chat Panel */}
      {showNewChat && (
        <div className="new-chat-panel">
          <div className="new-chat-header">
            <button className="back-button" onClick={() => setShowNewChat(false)}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"/>
              </svg>
            </button>
            <span>New Chat</span>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="user-list">
            {users.map((user) => (
              <div key={user._id} className="user-item" onClick={() => startChat(user._id)}>
                <div className="user-avatar">{user.avatar || '👤'}</div>
                <div className="user-details">
                  <div className="user-name">{user.displayName}</div>
                  <div className="user-about">{user.about}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
        </svg>
        <input type="text" placeholder="Search or start new chat" />
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="empty-state">
            <p>No chats yet</p>
            <p>Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">{getChatAvatar(chat)}</div>
              <div className="chat-info">
                <div className="chat-header-row">
                  <span className="chat-name">{getChatName(chat)}</span>
                  {chat.lastMessageAt && (
                    <span className="chat-time">
                      {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <div className="chat-preview">
                  {chat.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

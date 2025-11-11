import React, { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import './ChatWindow.css';

const ChatWindow = ({ chat, messages, currentUser, onSendMessage, socket }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !chat) return;

    socket.on('typing:start', ({ chatId, userId }) => {
      if (chatId === chat._id && userId !== currentUser?.id) {
        setIsTyping(true);
      }
    });

    socket.on('typing:stop', ({ chatId, userId }) => {
      if (chatId === chat._id && userId !== currentUser?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, chat, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (socket && chat) {
      socket.emit('typing:start', { chatId: chat._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { chatId: chat._id });
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
      if (socket && chat) {
        socket.emit('typing:stop', { chatId: chat._id });
      }
    }
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm');
    }
  };

  const getChatName = () => {
    if (!chat) return '';
    if (chat.isGroup) return chat.groupName;
    const otherUser = chat.participants?.find((p) => p._id !== currentUser?.id);
    return otherUser?.displayName || 'Unknown';
  };

  const getChatAvatar = () => {
    if (!chat) return '👤';
    if (chat.isGroup) return chat.groupAvatar || '👥';
    const otherUser = chat.participants?.find((p) => p._id !== currentUser?.id);
    return otherUser?.avatar || '👤';
  };

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <div className="empty-chat-icon">
            <svg viewBox="0 0 303 172" width="360" height="205">
              <path fill="var(--text-tertiary)" d="M229.5 14.5c10.1 0 18.4 8.3 18.4 18.4v92.8c0 10.1-8.3 18.4-18.4 18.4H149l-45.5 27.3c-1.6 1-3.7-.3-3.7-2.2v-25.1H73.5c-10.1 0-18.4-8.3-18.4-18.4V32.9c0-10.1 8.3-18.4 18.4-18.4h156z"/>
              <path fill="var(--bg-message-in)" d="M229.5 14.5c10.1 0 18.4 8.3 18.4 18.4v92.8c0 10.1-8.3 18.4-18.4 18.4H149l-45.5 27.3c-1.6 1-3.7-.3-3.7-2.2v-25.1H73.5c-10.1 0-18.4-8.3-18.4-18.4V32.9c0-10.1 8.3-18.4 18.4-18.4h156m0-5H73.5c-12.9 0-23.4 10.5-23.4 23.4v92.8c0 12.9 10.5 23.4 23.4 23.4h21.3v20.1c0 5.3 5.9 8.5 10.4 5.6l45.5-27.3h79.8c12.9 0 23.4-10.5 23.4-23.4V32.9c-.1-12.9-10.6-23.4-23.4-23.4z"/>
            </svg>
          </div>
          <h2>Cross-Chat Web</h2>
          <p>Send and receive messages without keeping your phone online.</p>
          <p>Use Cross-Chat on up to 4 linked devices and 1 phone at the same time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-info">
          <div className="header-avatar">{getChatAvatar()}</div>
          <div className="header-text">
            <div className="header-name">{getChatName()}</div>
            <div className="header-status">
              {isTyping ? 'typing...' : 'online'}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-button">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"/>
            </svg>
          </button>
          <button className="icon-button">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-area">
          {messages.map((message, index) => {
            const isOwn = message.sender._id === currentUser?.id;
            const showDate =
              index === 0 ||
              new Date(messages[index - 1].createdAt).toDateString() !==
                new Date(message.createdAt).toDateString();

            return (
              <React.Fragment key={message._id}>
                {showDate && (
                  <div className="message-date">
                    {isToday(new Date(message.createdAt))
                      ? 'Today'
                      : isYesterday(new Date(message.createdAt))
                      ? 'Yesterday'
                      : format(new Date(message.createdAt), 'dd/MM/yyyy')}
                  </div>
                )}
                <div className={`message ${isOwn ? 'message-out' : 'message-in'}`}>
                  <div className="message-content">
                    <span className="message-text">{message.content}</span>
                    <span className="message-time">
                      {format(new Date(message.createdAt), 'HH:mm')}
                      {isOwn && (
                        <span className="message-status">
                          {message.status === 'read' ? (
                            <svg viewBox="0 0 16 15" width="16" height="15">
                              <path fill="#53bdeb" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                            </svg>
                          ) : message.status === 'delivered' ? (
                            <svg viewBox="0 0 16 15" width="16" height="15">
                              <path fill="var(--text-tertiary)" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 12 11" width="12" height="11">
                              <path fill="var(--text-tertiary)" d="M11.1 2.3l-.5-.4c-.2-.1-.4-.1-.5.1L5.6 7.2c-.1.1-.3.1-.4 0l-.3-.3c-.1-.1-.3-.1-.4 0l-.4.5c-.1.1-.1.3 0 .4l1.3 1.3c.1.1.4.1.5 0L11.2 3c.1-.2.1-.5-.1-.7z"/>
                            </svg>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-footer">
        <button className="icon-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"/>
          </svg>
        </button>
        <button className="icon-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"/>
          </svg>
        </button>
        <form onSubmit={handleSubmit} className="message-input-form">
          <input
            type="text"
            className="message-input"
            placeholder="Type a message"
            value={messageInput}
            onChange={handleInputChange}
          />
        </form>
        <button type="submit" className="send-button" onClick={handleSubmit} disabled={!messageInput.trim()}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

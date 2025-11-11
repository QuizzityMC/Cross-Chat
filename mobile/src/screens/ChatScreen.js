import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Initialize socket
    socketRef.current = io('http://localhost:3000', {
      auth: { token },
    });

    socketRef.current.on('message:new', (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socketRef.current.emit('message:send', {
      chatId,
      content: messageInput,
      tempId: Date.now(),
    });

    setMessageInput('');
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender._id === user?.id;

    return (
      <View
        style={[
          styles.message,
          isOwn ? styles.messageOut : styles.messageIn,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {format(new Date(item.createdAt), 'HH:mm')}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#8696a0"
          value={messageInput}
          onChangeText={setMessageInput}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!messageInput.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  messagesList: {
    padding: 16,
  },
  message: {
    maxWidth: '75%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#202c33',
  },
  messageOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#005c4b',
  },
  messageText: {
    color: '#e9edef',
    fontSize: 15,
    marginBottom: 4,
  },
  messageTime: {
    color: '#8696a0',
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#202c33',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a3942',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#e9edef',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ChatScreen;

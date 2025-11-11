import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.groupName;
    const otherUser = chat.participants?.find((p) => p._id !== user?.id);
    return otherUser?.displayName || 'Unknown';
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          chatId: item._id,
          chatName: getChatName(item),
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.isGroup ? '👥' : '👤'}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{getChatName(item)}</Text>
          {item.lastMessageAt && (
            <Text style={styles.chatTime}>
              {formatDistanceToNow(new Date(item.lastMessageAt))}
            </Text>
          )}
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubtext}>Start a new conversation</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3942',
    backgroundColor: '#0b141a',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#005c4b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e9edef',
  },
  chatTime: {
    fontSize: 12,
    color: '#667781',
  },
  chatPreview: {
    fontSize: 14,
    color: '#8696a0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8696a0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#667781',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f87171',
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatListScreen;

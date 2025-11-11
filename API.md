# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "avatar": "",
    "about": "Hey there! I am using Cross-Chat"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "avatar": "",
    "about": "Hey there! I am using Cross-Chat",
    "status": "online"
  }
}
```

### Users

#### Search Users
```http
GET /api/users?search=john
```
*Requires authentication*

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatar": "",
    "about": "Hey there! I am using Cross-Chat",
    "status": "online"
  }
]
```

#### Get User Profile
```http
GET /api/users/:userId
```
*Requires authentication*

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "displayName": "John Doe",
  "avatar": "",
  "about": "Hey there! I am using Cross-Chat",
  "status": "online",
  "lastSeen": "2023-12-01T10:30:00.000Z"
}
```

#### Update Profile
```http
PUT /api/users/profile
```
*Requires authentication*

**Request Body:**
```json
{
  "displayName": "John Smith",
  "about": "Available",
  "avatar": "👨"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Smith",
  "avatar": "👨",
  "about": "Available",
  "status": "online"
}
```

### Chats

#### Get All Chats
```http
GET /api/chats
```
*Requires authentication*

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "participants": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "displayName": "John Doe",
        "avatar": "👨"
      }
    ],
    "isGroup": false,
    "lastMessage": {
      "_id": "507f1f77bcf86cd799439013",
      "content": "Hello!",
      "createdAt": "2023-12-01T10:30:00.000Z"
    },
    "lastMessageAt": "2023-12-01T10:30:00.000Z"
  }
]
```

#### Create/Get Direct Chat
```http
POST /api/chats/direct
```
*Requires authentication*

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "participants": [...],
  "isGroup": false
}
```

#### Create Group Chat
```http
POST /api/chats/group
```
*Requires authentication*

**Request Body:**
```json
{
  "name": "Family Group",
  "participants": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439014"]
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "participants": [...],
  "isGroup": true,
  "groupName": "Family Group",
  "admin": {...}
}
```

#### Get Chat Details
```http
GET /api/chats/:chatId
```
*Requires authentication*

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "participants": [...],
  "isGroup": false,
  "lastMessage": {...},
  "lastMessageAt": "2023-12-01T10:30:00.000Z"
}
```

### Messages

#### Get Messages
```http
GET /api/messages/:chatId?limit=50&before=2023-12-01T10:30:00.000Z
```
*Requires authentication*

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `before` (optional): ISO date string to get messages before this date

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "chatId": "507f1f77bcf86cd799439012",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "displayName": "John Doe",
      "avatar": "👨"
    },
    "content": "Hello!",
    "messageType": "text",
    "status": "read",
    "createdAt": "2023-12-01T10:30:00.000Z",
    "readBy": [...]
  }
]
```

#### Mark Messages as Read
```http
POST /api/messages/:chatId/read
```
*Requires authentication*

**Request Body:**
```json
{
  "messageIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
}
```

**Response:**
```json
{
  "success": true
}
```

## WebSocket Events

### Connection

Connect to WebSocket:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client → Server Events

#### Send Message
```javascript
socket.emit('message:send', {
  chatId: '507f1f77bcf86cd799439012',
  content: 'Hello!',
  messageType: 'text',
  mediaUrl: '',
  tempId: Date.now()
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', {
  chatId: '507f1f77bcf86cd799439012'
});

// Stop typing
socket.emit('typing:stop', {
  chatId: '507f1f77bcf86cd799439012'
});
```

#### Message Status
```javascript
// Mark as delivered
socket.emit('message:delivered', {
  messageId: '507f1f77bcf86cd799439013'
});

// Mark as read
socket.emit('message:read', {
  messageId: '507f1f77bcf86cd799439013'
});
```

### Server → Client Events

#### New Message
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
  // message: { _id, chatId, sender, content, ... }
});
```

#### Message Status Update
```javascript
socket.on('message:status', ({ messageId, status, userId }) => {
  console.log(`Message ${messageId} status: ${status}`);
});
```

#### User Status
```javascript
socket.on('user:status', ({ userId, status, lastSeen }) => {
  console.log(`User ${userId} is ${status}`);
});
```

#### Typing Indicators
```javascript
socket.on('typing:start', ({ chatId, userId }) => {
  console.log(`User ${userId} is typing in chat ${chatId}`);
});

socket.on('typing:stop', ({ chatId, userId }) => {
  console.log(`User ${userId} stopped typing`);
});
```

#### Message Sent Confirmation
```javascript
socket.on('message:sent', ({ tempId, messageId }) => {
  // Replace temporary message with actual message
  console.log(`Temp message ${tempId} is now ${messageId}`);
});
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

## Data Models

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  displayName: String,
  avatar: String,
  status: 'online' | 'offline' | 'away',
  about: String,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat
```javascript
{
  _id: ObjectId,
  participants: [ObjectId],
  isGroup: Boolean,
  groupName: String,
  groupAvatar: String,
  admin: ObjectId,
  lastMessage: ObjectId,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  chatId: ObjectId,
  sender: ObjectId,
  content: String,
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file',
  mediaUrl: String,
  status: 'sent' | 'delivered' | 'read',
  readBy: [{ user: ObjectId, readAt: Date }],
  createdAt: Date,
  updatedAt: Date
}
```

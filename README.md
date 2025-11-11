# Cross-Chat

A modern, self-hosted cross-platform communications platform with a WhatsApp-like UI. Built for Ubuntu servers with support for web, desktop, and Android clients.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication system
- 💬 **Real-time Messaging** - WebSocket-based instant messaging
- 👥 **Group Chats** - Create and manage group conversations
- 📱 **Cross-Platform** - Web, Desktop (Windows/macOS/Linux), and Android apps
- 🎨 **Modern UI** - WhatsApp-inspired sleek and intuitive interface
- 🔔 **Notifications** - Real-time message notifications
- 📊 **Message Status** - Sent, delivered, and read indicators
- 🔄 **Online Status** - See when users are online
- 🐳 **Docker Support** - Easy deployment with Docker Compose

## 🚀 Super Simple Setup (3 Steps!)

The easiest way to get Cross-Chat running on your machine:

### Step 1: Install Docker
**Already have Docker?** Skip to Step 2!

**Don't have Docker?** Install it:
- **Windows/Mac**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Ubuntu/Linux**: 
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```

### Step 2: Get Cross-Chat
```bash
git clone https://github.com/QuizzityMC/Cross-Chat.git
cd Cross-Chat
```

### Step 3: Start Everything!
```bash
docker-compose up -d
```

**That's it!** 🎉 

Open your browser to:
- **Web App**: http://localhost
- **API**: http://localhost:3000

### First Use
1. Open http://localhost in your browser
2. Click "Sign up" 
3. Create an account
4. Start chatting!

> **⚠️ Security Note for Production**: The default setup uses a pre-configured JWT secret for ease of setup. For production deployments, create a `.env` file with a secure random `JWT_SECRET` before running `docker-compose up -d`:
> ```bash
> cp .env.example .env
> # Edit .env and change JWT_SECRET to a long random string
> ```

### To Stop
```bash
docker-compose down
```

---

## Architecture

### Backend
- **Node.js & Express** - REST API server
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database for users, chats, and messages
- **JWT** - Secure authentication tokens

### Web Client
- **React** - Modern UI library
- **Vite** - Fast build tool
- **Socket.IO Client** - Real-time messaging
- **Responsive Design** - Works on all screen sizes

### Desktop App
- **Electron** - Cross-platform desktop wrapper
- **Works on** Windows, macOS, and Linux

### Mobile App
- **React Native** - Native mobile experience
- **Android Support** - APK building included

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Docker & Docker Compose (for containerized deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/QuizzityMC/Cross-Chat.git
cd Cross-Chat
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Option A: Docker Deployment (Recommended)**
```bash
docker-compose up -d
```

The application will be available at:
- Web Client: http://localhost
- Backend API: http://localhost:3000

4. **Option B: Manual Installation**

Install all dependencies:
```bash
npm run install:all
```

Start MongoDB (if not using Docker):
```bash
mongod --dbpath /path/to/data
```

Start the backend:
```bash
npm start
```

Start the web client (in a new terminal):
```bash
cd web-client
npm run dev
```

## Running Different Clients

### Web Client
```bash
cd web-client
npm install
npm run dev
```
Access at http://localhost:3001

### Desktop App
```bash
cd desktop
npm install
npm start
```

Build for production:
```bash
npm run build          # Build for current platform
npm run build:win      # Build for Windows
npm run build:mac      # Build for macOS
npm run build:linux    # Build for Linux
```

### Mobile App (Android)

**Note:** The mobile app requires React Native native directories (android/ios) which are not included in the repository to keep it clean. We provide an automated setup script.

#### Quick Setup (Recommended):
```bash
cd mobile
npm install
npm run setup  # Automated setup script
npm run android
```

#### What the setup script does:
- Creates a temporary React Native 0.71.7 project
- Copies android and ios directories
- Updates package names and configurations
- Cleans up temporary files

For detailed instructions, troubleshooting, and manual setup, see [mobile/README.md](mobile/README.md).

**Alternative:** Download pre-built APK from [Releases](https://github.com/QuizzityMC/Cross-Chat/releases) (coming soon)

The APK will be in `mobile/android/app/build/outputs/apk/release/`

## Development

### Backend Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Testing
```bash
npm test
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Users
- `GET /api/users` - Search users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update own profile

#### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats/direct` - Create/get direct chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/:chatId` - Get chat details

#### Messages
- `GET /api/messages/:chatId` - Get messages for chat
- `POST /api/messages/:chatId/read` - Mark messages as read

### WebSocket Events

#### Client → Server
- `message:send` - Send a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:delivered` - Message delivered
- `message:read` - Message read

#### Server → Client
- `message:new` - New message received
- `message:status` - Message status updated
- `user:status` - User online/offline status
- `typing:start` - Someone is typing
- `typing:stop` - Someone stopped typing

## Deployment to Ubuntu Server

### Using Docker (Recommended)

1. Install Docker and Docker Compose on your Ubuntu server
2. Clone the repository
3. Configure environment variables in `.env`
4. Run: `docker-compose up -d`

### Manual Deployment

1. Install Node.js 18+ and MongoDB
2. Clone repository
3. Install dependencies: `npm install`
4. Build web client: `cd web-client && npm run build`
5. Set up systemd service or PM2 for process management
6. Configure nginx as reverse proxy
7. Set up SSL with Let's Encrypt

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## Configuration

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crosschat
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5000
```

## Project Structure

```
Cross-Chat/
├── server/                 # Backend Node.js server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── socket/            # WebSocket handlers
│   └── index.js           # Server entry point
├── web-client/            # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── services/      # API services
│   └── public/
├── desktop/               # Electron desktop app
│   └── src/
│       ├── main.js        # Electron main process
│       └── preload.js     # Preload script
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   └── context/       # React context
│   ├── android/           # Android specific
│   └── ios/               # iOS specific
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Backend Docker image
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

- [ ] Voice messages
- [ ] Video calls
- [ ] File sharing
- [ ] End-to-end encryption
- [ ] iOS app
- [ ] Message search
- [ ] Dark/Light theme toggle
- [ ] Message reactions
- [ ] Status updates

---

Built with ❤️ for modern communication

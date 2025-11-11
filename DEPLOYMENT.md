# Deployment Guide for Ubuntu Server

This guide will help you deploy Cross-Chat on an Ubuntu 20.04+ server.

## Prerequisites

- Ubuntu 20.04 LTS or newer
- Root or sudo access
- Domain name (optional, but recommended for SSL)

## Method 1: Docker Deployment (Recommended)

### Step 1: Install Docker

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER
```

Log out and back in for group changes to take effect.

### Step 2: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/QuizzityMC/Cross-Chat.git
cd Cross-Chat

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Set the following in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/crosschat
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
```

### Step 3: Deploy

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 4: Set up Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/crosschat
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/crosschat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Set up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Method 2: Manual Deployment

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/QuizzityMC/Cross-Chat.git
cd Cross-Chat

# Install backend dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env
```

### Step 3: Build Web Client

```bash
cd web-client
npm install
npm run build
cd ..
```

### Step 4: Set up PM2

```bash
# Start backend with PM2
pm2 start server/index.js --name cross-chat-backend

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Step 5: Set up Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/crosschat
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Web client
    location / {
        root /path/to/Cross-Chat/web-client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/crosschat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Set up SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Maintenance

### Update Application

```bash
cd Cross-Chat
git pull
npm install
cd web-client && npm install && npm run build
pm2 restart cross-chat-backend
```

### View Logs

```bash
# PM2 logs
pm2 logs cross-chat-backend

# Docker logs
docker-compose logs -f

# MongoDB logs
sudo journalctl -u mongod
```

### Backup Database

```bash
# Create backup
mongodump --out /path/to/backup/$(date +%Y%m%d)

# Restore backup
mongorestore /path/to/backup/20231201
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# If using SSH
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable
```

## Security Best Practices

1. Change default JWT_SECRET to a strong random value
2. Use HTTPS in production
3. Keep system and dependencies updated
4. Use strong MongoDB passwords
5. Limit MongoDB access to localhost
6. Regular backups
7. Monitor logs for suspicious activity

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### MongoDB Connection Issues
```bash
sudo systemctl status mongod
sudo journalctl -u mongod
```

### Check Running Services
```bash
# PM2
pm2 status

# Docker
docker-compose ps

# Nginx
sudo systemctl status nginx
```

## Performance Optimization

### MongoDB Indexes
MongoDB indexes are automatically created by Mongoose, but you can verify:

```bash
mongo crosschat
db.messages.getIndexes()
db.users.getIndexes()
```

### PM2 Clustering
For better performance with multiple CPU cores:

```bash
pm2 start server/index.js -i max --name cross-chat-backend
```

### Nginx Caching
Add to Nginx configuration:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Support

For issues or questions, please open an issue on GitHub.

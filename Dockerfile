FROM node:18-slim

WORKDIR /app

# Copy only package.json (avoid package-lock.json issues)
COPY package.json ./

# Install all dependencies  
RUN npm install --no-package-lock

# Copy server files
COPY server ./server

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

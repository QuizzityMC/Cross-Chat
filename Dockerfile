FROM node:18-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund --omit=dev

# Copy application files
COPY server ./server

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

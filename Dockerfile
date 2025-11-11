FROM node:18-slim

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies if not present
RUN if [ ! -d "node_modules" ]; then \
      npm install --omit=dev --no-audit --no-fund; \
    fi

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

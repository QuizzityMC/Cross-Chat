FROM node:18-alpine

WORKDIR /app

# Copy everything including node_modules if present
COPY . .

# Install/update dependencies
# Note: If you get MODULE_NOT_FOUND errors, run `npm install` on your host machine first
RUN npm install --omit=dev --no-audit --no-fund 2>&1 || true

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server  
CMD ["npm", "start"]

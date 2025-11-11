FROM node:18-slim

WORKDIR /app

# Copy application files (including node_modules if present)
COPY . .

# Try to install/update dependencies, but don't fail if it times out
RUN timeout 60 npm install --no-package-lock --no-audit --no-fund --loglevel=error 2>&1 || \
    echo "npm install had issues, but continuing with existing node_modules..."

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

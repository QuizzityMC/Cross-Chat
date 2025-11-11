# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
# Note: If you get vite not found errors, run `npm install` in web-client directory on your host first
RUN npm install --no-audit --no-fund 2>&1 || true

# Build the app  
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

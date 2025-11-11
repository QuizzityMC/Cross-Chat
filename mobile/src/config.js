// API Configuration
// Update this URL to point to your Cross-Chat backend server

// For development (Android emulator)
// Use 10.0.2.2 to access localhost from Android emulator
// Use your computer's IP address for physical devices

// For production, use your server's URL
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000'  // Android emulator
  : 'https://your-production-server.com';  // Production server

export default {
  API_URL,
  SOCKET_URL: API_URL,
};

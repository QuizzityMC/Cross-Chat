# Cross-Chat Mobile App

## Important Notice

The React Native mobile app requires platform-specific native code (Android/iOS directories) to build. These directories are not included in the repository to keep it clean and reduce repository size.

## Quick Setup (Automated)

We provide a setup script that automates the process:

```bash
cd mobile
npm install
npm run setup
```

This script will:
1. Create a temporary React Native project with the correct version
2. Copy the android and ios directories
3. Update package names and app configuration
4. Clean up temporary files

After setup completes, you can run:
```bash
npm run android  # For Android
npm run ios      # For iOS (macOS only)
```

## Manual Setup

If the automated setup doesn't work, follow these steps:

### Prerequisites
- Node.js 18+
- **JDK 17 or 21** (for Android) - React Native 0.76.9 supports JDK 17-21
- Android Studio with Android SDK
- For iOS: macOS with Xcode

**JDK Installation:**
- Check your JDK version: `java -version`
- React Native 0.76.9 requires JDK 17 or higher
- Recommended: JDK 17 for best compatibility

### Steps

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Initialize React Native platform directories:**
   ```bash
   npx react-native init CrossChatTemp --version 0.76.9
   ```

3. **Copy platform directories:**
   ```bash
   cp -r CrossChatTemp/android ./
   cp -r CrossChatTemp/ios ./
   rm -rf CrossChatTemp
   ```

4. **Update Android package name:**
   - Edit `android/app/src/main/java/com/crosschattemp/MainActivity.java`
   - Rename package to `com.crosschat`
   - Update `android/app/build.gradle` applicationId to `com.crosschat`
   - Update `android/app/src/main/AndroidManifest.xml` package name

5. **Configure API URL:**
   - Edit `src/config.js`
   - Update `API_URL` to point to your backend server
   - For Android emulator, use `http://10.0.2.2:3000`
   - For physical device, use your computer's IP address

6. **Run the app:**
   ```bash
   npm run android
   ```

## Configuration

### Backend URL

Update `src/config.js` with your backend server URL:

```javascript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000'  // Android emulator
  : 'https://your-server.com';  // Production
```

**Important:** 
- `10.0.2.2` is a special alias to your host loopback interface in Android emulator
- For physical devices, use your computer's actual IP address (e.g., `http://192.168.1.100:3000`)
- For production, use your server's public URL

## Building for Production

### Android APK

```bash
npm run build:android
```

The APK will be in `android/app/build/outputs/apk/release/app-release.apk`

### Signing the APK

For production release, you need to sign the APK:

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Edit `android/gradle.properties` and add:
   ```
   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=my-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=*****
   MYAPP_RELEASE_KEY_PASSWORD=*****
   ```

3. Build the release APK:
   ```bash
   npm run build:android
   ```

## Troubleshooting

### "Android project not found"
- Run `npm run setup` or follow manual setup steps
- Ensure android directory exists in mobile/

### "Unable to connect to server"
- Check that backend server is running
- Verify API_URL in src/config.js
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure device and computer are on same network

### Build errors
- **JDK version**: React Native 0.76.9 requires JDK 17 or higher. If you see build errors, ensure you have JDK 17 or 21 installed.
- Run `cd android && ./gradlew clean` 
- Delete `android/app/build` directory
- Run `npm run android` again

### Metro bundler issues
- Stop Metro: Ctrl+C
- Clear cache: `npm start -- --reset-cache`

## Alternative: Expo

For easier development without native setup, consider using Expo:

```bash
npm install -g expo-cli
expo init CrossChatMobile
# Choose "blank" template
# Copy src/ files and adapt for Expo
```

## Pre-built APKs

Pre-built APK files will be available in the [GitHub Releases](https://github.com/QuizzityMC/Cross-Chat/releases) section.

## Support

For issues:
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Cross-Chat Issues](https://github.com/QuizzityMC/Cross-Chat/issues)


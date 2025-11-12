#!/bin/bash

# Cross-Chat Mobile Setup Script
# This script helps set up the React Native mobile app

echo "Cross-Chat Mobile Setup"
echo "======================="
echo ""

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the mobile/ directory"
    exit 1
fi

# Check if android directory exists
if [ -d "android" ]; then
    echo "✓ Android directory already exists"
    echo "  Run 'npm run android' to start the app"
    exit 0
fi

echo "Setting up React Native project..."
echo ""
echo "This will:"
echo "1. Create a temporary React Native project"
echo "2. Copy the android and ios directories"
echo "3. Clean up temporary files"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Create temporary directory
TEMP_DIR="../temp_rn_project"
echo "Creating temporary React Native project..."
npx react-native init CrossChatTemp --directory="$TEMP_DIR" --version 0.76.9

if [ $? -ne 0 ]; then
    echo "Error: Failed to create React Native project"
    exit 1
fi

# Copy android and ios directories
echo "Copying platform directories..."
cp -r "$TEMP_DIR/android" ./
cp -r "$TEMP_DIR/ios" ./

# Update package name in Android
echo "Updating Android package name..."
find android -type f -name "*.java" -exec sed -i 's/com.crosschattemp/com.crosschat/g' {} +
find android -type f -name "*.xml" -exec sed -i 's/com.crosschattemp/com.crosschat/g' {} +
find android -type f -name "*.gradle" -exec sed -i 's/com.crosschattemp/com.crosschat/g' {} +

# Update app name in Android
sed -i 's/CrossChatTemp/CrossChat/g' android/app/src/main/res/values/strings.xml

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you have Android Studio installed with Android SDK"
echo "2. Update src/config.js with your backend server URL"
echo "3. Run 'npm run android' to start the app"
echo ""
echo "For more information, see README.md"

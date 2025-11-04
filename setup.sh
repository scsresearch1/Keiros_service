#!/bin/bash

# Keiros Service App Installation Script
# This script helps set up the development environment

echo "🚀 Setting up Keiros Service App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended version is 16 or higher."
fi

# Install Expo CLI globally if not already installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is already installed"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p assets

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Install Expo Go app on your Android device"
echo "2. Run 'npm start' to start the development server"
echo "3. Scan the QR code with Expo Go to run the app"
echo ""
echo "For ESP32 testing:"
echo "1. Upload the esp32_firmware_example.ino to your ESP32 device"
echo "2. Ensure your ESP32 device is powered on and advertising"
echo "3. Use the app to scan and configure your ESP32 device"
echo ""
echo "Happy coding! 🚀"

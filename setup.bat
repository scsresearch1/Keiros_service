@echo off
echo 🚀 Setting up Keiros Service App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm is installed

REM Install Expo CLI globally if not already installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Expo CLI...
    npm install -g @expo/cli
) else (
    echo ✅ Expo CLI is already installed
)

REM Install project dependencies
echo 📦 Installing project dependencies...
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist assets mkdir assets

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Install Expo Go app on your Android device
echo 2. Run 'npm start' to start the development server
echo 3. Scan the QR code with Expo Go to run the app
echo.
echo For ESP32 testing:
echo 1. Upload the esp32_firmware_example.ino to your ESP32 device
echo 2. Ensure your ESP32 device is powered on and advertising
echo 3. Use the app to scan and configure your ESP32 device
echo.
echo Happy coding! 🚀
pause

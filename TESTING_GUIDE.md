# Keiros Service App - Testing Guide

## 🚨 **Important: Native Modules Require Development Builds**

Your app uses `react-native-bluetooth-serial` which is a **native module**. This means:
- ❌ **Expo Go won't work** (doesn't support custom native modules)
- ✅ **Expo Development Builds are required**
- ✅ **EAS Build for production deployment**

## 🧪 **Testing Options**

### **Option 1: Local Development Build (Recommended for Testing)**

**Prerequisites:**
- Android Studio installed
- Android SDK configured
- Physical Android device with USB debugging enabled

**Steps:**
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and install on device:**
   ```bash
   npx expo run:android
   ```
   This will:
   - Build the app with native modules
   - Install it on your connected Android device
   - Start the Metro bundler

3. **Test with your ESP32:**
   - Ensure your ESP32 is running the updated firmware
   - Open the app on your Android device
   - Scan for "ESP32_GPS_BT" device
   - Test Bluetooth connection and WiFi configuration

### **Option 2: EAS Development Build (Cloud Build)**

**Prerequisites:**
- Expo account
- EAS CLI installed

**Steps:**
1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build development version:**
   ```bash
   eas build --profile development --platform android
   ```

5. **Install on device:**
   - Download the APK from the build link
   - Install on your Android device
   - Start development server: `npx expo start --dev-client`

### **Option 3: Production Build (Expo.dev)**

**For final deployment:**

1. **Build production version:**
   ```bash
   eas build --profile production --platform android
   ```

2. **Submit to Google Play Store:**
   ```bash
   eas submit --platform android
   ```

## 🔧 **ESP32 Testing Setup**

### **1. Upload Updated Firmware:**
- Upload `esp32_firmware_updated.ino` to your ESP32
- Ensure device name is "ESP32_GPS_BT"
- Verify Bluetooth is advertising

### **2. Test Commands:**
Your ESP32 should respond to:
- `STATUS` - Device information
- `FLASH_READ` - Read GPS data
- `WIFI_CONFIG:ssid:password` - Configure WiFi

### **3. Expected Behavior:**
- App should find "ESP32_GPS_BT" in device list
- Connection should establish successfully
- WiFi configuration should work
- Commands should return responses

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"No devices found":**
   - Ensure ESP32 is powered on
   - Check Bluetooth is enabled on Android
   - Verify ESP32 is advertising (check Serial Monitor)

2. **"Connection failed":**
   - Pair the device in Android Bluetooth settings first
   - Ensure ESP32 is not connected to another device
   - Try restarting Bluetooth on both devices

3. **"WiFi configuration failed":**
   - Check WiFi credentials are correct
   - Ensure ESP32 firmware supports WIFI_CONFIG command
   - Verify command format: `WIFI_CONFIG:ssid:password`

4. **Build errors:**
   - Ensure Android Studio is properly configured
   - Check Android SDK is installed
   - Verify device is connected and USB debugging enabled

## 📱 **Testing Checklist**

- [ ] App builds successfully
- [ ] App installs on Android device
- [ ] Bluetooth permissions granted
- [ ] ESP32 device appears in scan
- [ ] Connection establishes successfully
- [ ] STATUS command returns device info
- [ ] WiFi configuration works
- [ ] FLASH_READ command returns data
- [ ] App handles errors gracefully

## 🚀 **Next Steps After Testing**

1. **Fix any issues** found during testing
2. **Optimize performance** if needed
3. **Add additional features** based on requirements
4. **Deploy to production** using EAS Build
5. **Submit to app stores** if desired

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review ESP32 Serial Monitor for errors
3. Check Android device logs for Bluetooth issues
4. Verify all dependencies are correctly installed

---

**Remember:** Since this app uses native Bluetooth modules, you must use Development Builds or EAS Build - Expo Go will not work!

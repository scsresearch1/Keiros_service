# Keiros Service App - Build Instructions

## 🚀 **EAS Build Setup Complete!**

Your project is now configured for EAS Build. Here's what you need to do:

### **Step 1: Build the App**

Run this command in your terminal:

```bash
eas build --profile development --platform android
```

When prompted:
- **Android application id**: Use `com.keiros.service` (already configured)
- **Generate a new Android Keystore**: Choose **Yes** (this will create credentials for you)

### **Step 2: Download and Install**

1. After the build completes, you'll get a download link
2. Download the APK file to your Android device
3. Install the APK (you may need to enable "Install from unknown sources")

### **Step 3: Test with ESP32**

1. **Upload the updated firmware** (`esp32_firmware_updated.ino`) to your ESP32
2. **Pair your ESP32** with your Android phone in Bluetooth settings
   - Look for device name: "ESP32_GPS_BT"
3. **Open the Keiros Service app**
4. **Test the functionality**:
   - Scan for devices
   - Connect to ESP32
   - Test WiFi configuration
   - Test device commands (STATUS, FLASH_READ)

### **Alternative: Use Expo Go (Limited)**

If you want to test the UI without Bluetooth functionality:

```bash
npx expo start
```

Then scan the QR code with Expo Go app. Note: Bluetooth features won't work in Expo Go.

### **Troubleshooting**

- **Build fails**: Make sure you're logged into EAS (`eas login`)
- **App won't install**: Enable "Install from unknown sources" in Android settings
- **Bluetooth not working**: Ensure ESP32 is paired in Android Bluetooth settings first

### **Next Steps**

1. Test the app with your ESP32 device
2. Report any issues you find
3. When ready, build production version: `eas build --profile production --platform android`

---

**Your app is ready to build!** 🎉

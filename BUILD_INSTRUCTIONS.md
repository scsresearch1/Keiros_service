<<<<<<< HEAD
# Build Instructions - Final Steps

## ✅ Completed
- ✅ Project linked to Expo.dev (ID: 8657b0f9-0d7a-43d7-a32b-c34a8e262aef)
- ✅ Git repository initialized
- ✅ All files committed
- ✅ EAS configuration ready

## 🔧 Final Step (Run in Your Terminal)

The build needs to generate an Android keystore, which requires interactive confirmation.

### Option 1: Let EAS Generate Keystore (Recommended)

Run this in your terminal:

```bash
cd f:\Keiros_Service_App_V3
eas build --platform android --profile preview
```

When prompted: **"Generate a new Android Keystore?"**
- Type: **`yes`** or **`y`** and press Enter

EAS will:
- Generate a keystore automatically
- Store it securely on Expo servers
- Use it for all future builds

### Option 2: Use Existing Keystore

If you already have a keystore:

```bash
eas credentials
```

Then select:
- Platform: Android
- Action: Use existing keystore
- Upload your keystore file

## After Keystore is Set Up

Once the keystore is configured, the build will:
1. ✅ Start on Expo's build servers
2. ✅ Show you a QR code and build URL
3. ✅ Take 10-20 minutes (first build)
4. ✅ Be available on https://expo.dev

## Monitor Build Progress

- **Terminal**: You'll see build progress
- **Web**: Go to https://expo.dev → keirosservice → Builds
- **Email**: You'll get notified when build completes

## Download Build

Once complete:
1. Go to https://expo.dev/projects/keirosservice/builds
2. Click on the completed build
3. Download the APK file
4. Install on your Android device

## Next Builds

After the first build, subsequent builds are faster (5-10 minutes) because:
- Keystore is already configured
- Build environment is cached
- Dependencies are pre-installed

---

**Quick Command Reference:**

```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production

# View build status
eas build:list
```

=======
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
>>>>>>> e4c801c77fbe6f9b979e153814e61b56ddfef4c4

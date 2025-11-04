# Keiros Service App V3

An Android app built with Expo and React Native for managing ESP32 devices via Bluetooth.

## Features

- **Bluetooth Device Discovery**: Scan and connect to ESP32 devices
- **WiFi Configuration**: Configure WiFi SSID and password on ESP32 devices
- **Device Commands**: Send various commands to ESP32 devices:
  - Status check
  - GPS verification
  - WiFi verification
  - Device restart
  - Device shutdown
- **Dark Theme UI**: Modern dark-themed interface matching the design requirements

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Important**: This app uses Bluetooth functionality which requires native modules. Since we're using `react-native-bluetooth-serial-next`, you'll need to:

   **Option A: Use EAS Build (Recommended for Expo)**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform android --profile development
   ```

   **Option B: Use Expo Development Build**
   ```bash
   npx expo install expo-dev-client
   npx expo run:android
   ```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## Bluetooth Implementation Note

The Bluetooth service (`utils/bluetoothService.ts`) is currently set up as an abstraction layer. Once you provide the ESP32 firmware code, we'll:

1. Determine the exact Bluetooth protocol (Classic Bluetooth Serial, BLE, etc.)
2. Implement the actual Bluetooth communication based on the firmware
3. Configure command formats and response handling
4. Test the communication protocol

## Project Structure

```
.
├── app/                    # App screens and navigation
│   ├── index.tsx          # Home screen
│   ├── device-discovery.tsx  # Device scanning and connection
│   └── device-config.tsx  # Device configuration screen
├── assets/                # Images, fonts, and other assets
├── components/            # Reusable React components
├── constants/            # App constants
│   ├── Colors.ts         # Color definitions
│   └── Bluetooth.ts      # Bluetooth-related constants
└── utils/                # Utility functions
    └── bluetoothService.ts  # Bluetooth service abstraction
```

## Android Permissions

The app requires the following Android permissions (already configured in `app.json`):
- `BLUETOOTH`
- `BLUETOOTH_ADMIN`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `BLUETOOTH_CONNECT` (Android 12+)
- `BLUETOOTH_SCAN` (Android 12+)

## Publishing to Expo.dev

Since this app uses native modules (Bluetooth), you must use **EAS Build** instead of the legacy `expo publish` command.

### Prerequisites

1. **Install EAS CLI globally:**
```bash
npm install -g eas-cli
```

2. **Login to your Expo account:**
```bash
eas login
```
   If you don't have an account, create one at [expo.dev](https://expo.dev)

### Building the App

1. **For development/testing (APK):**
```bash
npm run build:android:preview
```
   Or use the full command:
```bash
eas build --platform android --profile preview
```

2. **For production (AAB for Play Store):**
```bash
npm run build:android:production
```
   Or use the full command:
```bash
eas build --platform android --profile production
```

3. **Monitor build progress:**
   - The build will start on Expo's servers
   - You'll get a QR code and link to track the build
   - Once complete, you can download the APK/AAB from the Expo dashboard

### Publishing to Expo.dev

After your build completes:

1. **View your builds on Expo.dev:**
   - Go to [expo.dev](https://expo.dev)
   - Navigate to your project: `keiros-service-app-v3`
   - View build history and download links

2. **For OTA Updates (JavaScript bundle only):**
   - OTA updates work with EAS Build
   - Use `expo publish` for JS-only updates (after initial EAS build)
   - Or use EAS Update for better control

### Quick Commands

```bash
# Build preview APK
npm run build:android:preview

# Build production AAB
npm run build:android:production

# Submit to Play Store (after production build)
npm run submit:android
```

### Notes

- **First build**: May take 10-20 minutes as EAS sets up the build environment
- **Subsequent builds**: Usually faster (5-10 minutes)
- **Native modules**: All native modules (including Bluetooth) are compiled in the build
- **Testing**: Install the APK on your Android device to test Bluetooth functionality

## Technologies

- Expo SDK 51
- React Native 0.74.5
- TypeScript
- Expo Router for navigation
- react-native-bluetooth-serial-next (requires development build)

## Next Steps

1. Review the ESP32 firmware code to understand the Bluetooth protocol
2. Implement the actual Bluetooth communication in `utils/bluetoothService.ts`
3. Configure command formats based on firmware requirements
4. Test communication with ESP32 device
5. Add error handling and response parsing

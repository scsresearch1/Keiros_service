<<<<<<< HEAD
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
=======
# Keiros Service - ESP32 Device Management App

A professional Android application for managing ESP32 devices through Bluetooth Low Energy (BLE) connectivity. This app allows you to scan for nearby ESP32 devices and configure their WiFi settings remotely.

## Features

- **Bluetooth Device Scanning**: Automatically discover ESP32 devices in your vicinity
- **Real-time Device Detection**: Live scanning with signal strength indicators
- **WiFi Configuration**: Remotely configure WiFi SSID and password for ESP32 devices
- **Professional UI**: Technical interface designed for ease of use
- **Device Management**: Connect, configure, and manage multiple ESP32 devices
- **Signal Strength Monitoring**: Visual indicators for device connectivity quality

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Android device with Bluetooth support
- ESP32 devices with BLE capabilities

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Install Expo Go app on your Android device
5. Scan the QR code with Expo Go to run the app

## ESP32 Firmware Requirements

Your ESP32 devices should be running firmware that supports:
- Bluetooth Low Energy (BLE) advertising
- WiFi configuration service
- BLE characteristic for receiving WiFi credentials

### Recommended ESP32 BLE Service UUIDs:
- Service UUID: `4FAFC201-1FB5-459E-8FCC-C5C9C331914B`
- Characteristic UUID: `BEB5483E-36E1-4688-B7F5-EA07361B26A8`

## Usage

1. **Enable Bluetooth**: Ensure Bluetooth is enabled on your Android device
2. **Start Scanning**: Tap "Start Device Scan" to discover nearby ESP32 devices
3. **Select Device**: Choose a device from the list to configure
4. **Connect**: Establish BLE connection with the selected device
5. **Configure WiFi**: Enter WiFi SSID and password
6. **Send Configuration**: Tap "Configure WiFi" to send settings to the device

## Permissions

The app requires the following permissions:
- Bluetooth access
- Location access (required for Bluetooth scanning)
- WiFi state access

## Technical Details

- **Framework**: React Native with Expo
- **Bluetooth**: react-native-ble-plx for BLE communication
- **UI**: React Native Paper for Material Design components
- **Navigation**: React Navigation for screen management

## Troubleshooting

### Common Issues:

1. **No devices found**: 
   - Ensure ESP32 devices are powered on and advertising
   - Check Bluetooth permissions
   - Verify device is within range

2. **Connection failed**:
   - Ensure device is not connected to another app
   - Try restarting Bluetooth on your device
   - Check ESP32 firmware compatibility

3. **WiFi configuration failed**:
   - Verify WiFi credentials are correct
   - Ensure ESP32 supports the WiFi configuration service
   - Check device is still connected

## Development

To modify or extend the app:

1. Edit source files in the `src/` directory
2. Modify Bluetooth service in `src/services/BluetoothService.js`
3. Update UI components in `src/screens/`
4. Customize theme in `src/styles/theme.js`

## Deployment

To build for production:

```bash
expo build:android
```

Or use EAS Build:

```bash
eas build --platform android
```

## License

This project is licensed under the MIT License.

## Support

For technical support or questions about ESP32 integration, please refer to the ESP32 documentation or contact the development team.
>>>>>>> e4c801c77fbe6f9b979e153814e61b56ddfef4c4

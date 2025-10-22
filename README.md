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

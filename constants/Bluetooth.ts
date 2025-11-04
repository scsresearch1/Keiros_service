/**
 * Bluetooth-related constants
 */

// ESP32 Device name patterns to look for
export const ESP32_DEVICE_PATTERNS = [
  'ESP32',
  'ESP32_GPS_BT',
  'ESP32test',
];

// Bluetooth UUIDs (will be updated based on firmware)
export const BLUETOOTH_UUIDS = {
  // Serial Port Profile (SPP) UUID
  SPP_UUID: '00001101-0000-1000-8000-00805f9b34fb',
};

// Command prefixes/suffixes (will be determined by firmware protocol)
export const COMMAND_FORMAT = {
  // These will be updated once we review the firmware
  PREFIX: '',
  SUFFIX: '\n',
  SEPARATOR: ',',
};

// Timeout values
export const TIMEOUTS = {
  SCAN: 10000, // 10 seconds
  CONNECT: 30000, // 30 seconds
  COMMAND: 5000, // 5 seconds
};


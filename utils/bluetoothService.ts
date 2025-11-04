/**
 * Bluetooth Service for ESP32 Communication
 * 
 * This service handles Classic Bluetooth Serial (SPP) communication with ESP32 devices.
 * 
 * Firmware Protocol:
 * - Device name: "ESP32_GPS_BT"
 * - Commands are newline-terminated strings
 * - Supported commands:
 *   - WIFI_CONFIG:<ssid>:<password> - Configure WiFi credentials
 *   - STATUS - Get device status (WiFi, GPS, MAC, IP, RSSI, Flash, GPS coordinates)
 *   - FLASH_READ - Read flash memory (optional)
 */

import BluetoothSerial from 'react-native-bluetooth-serial-next';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

export interface BluetoothServiceCallbacks {
  onDeviceFound?: (device: BluetoothDevice) => void;
  onConnected?: (device: BluetoothDevice) => void;
  onDisconnected?: () => void;
  onDataReceived?: (data: string) => void;
  onError?: (error: string) => void;
}

export interface DeviceStatus {
  mac?: string;
  wifi?: 'CONNECTED' | 'DISCONNECTED';
  ip?: string;
  rssi?: string;
  flash?: string;
  gps?: {
    valid: boolean;
    lat?: string;
    lng?: string;
  };
}

class BluetoothService {
  private connectedDevice: BluetoothDevice | null = null;
  private callbacks: BluetoothServiceCallbacks = {};
  private isConnected: boolean = false;
  private dataBuffer: string = '';
  private readListener: any = null;

  /**
   * Initialize Bluetooth service
   */
  async initialize(): Promise<boolean> {
    try {
      await BluetoothSerial.isEnabled();
      return true;
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      return false;
    }
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled(): Promise<boolean> {
    try {
      return await BluetoothSerial.isEnabled();
    } catch (error) {
      console.error('Bluetooth check error:', error);
      return false;
    }
  }

  /**
   * Enable Bluetooth (if supported)
   */
  async enableBluetooth(): Promise<boolean> {
    try {
      if (!(await BluetoothSerial.isEnabled())) {
        await BluetoothSerial.enable();
      }
      return true;
    } catch (error) {
      console.error('Enable Bluetooth error:', error);
      this.callbacks.onError?.('Failed to enable Bluetooth');
      return false;
    }
  }

  /**
   * Scan for available Bluetooth devices
   */
  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      const devices = await BluetoothSerial.list();
      
      // Filter for ESP32 devices (look for "ESP32" in name)
      const esp32Devices: BluetoothDevice[] = devices
        .filter((device: any) => 
          device.name && device.name.toUpperCase().includes('ESP32')
        )
        .map((device: any) => ({
          id: device.id || device.address,
          name: device.name || 'Unknown',
          address: device.address || device.id,
        }));

      // Trigger callbacks for found devices
      esp32Devices.forEach(device => {
        this.callbacks.onDeviceFound?.(device);
      });

      return esp32Devices;
    } catch (error: any) {
      console.error('Scan error:', error);
      this.callbacks.onError?.(error.message || 'Failed to scan for devices');
      return [];
    }
  }

  /**
   * Connect to a specific device
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.disconnect();
      }

      // Find device in list
      const devices = await BluetoothSerial.list();
      const device = devices.find((d: any) => (d.id || d.address) === deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Connect to device
      await BluetoothSerial.connect(deviceId);
      
      // Set up data listener
      this.setupDataListener();

      this.connectedDevice = {
        id: deviceId,
        name: device.name || 'Unknown',
        address: device.address || deviceId,
      };
      this.isConnected = true;

      this.callbacks.onConnected?.(this.connectedDevice);
      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      this.callbacks.onError?.(error.message || 'Failed to connect to device');
      this.isConnected = false;
      this.connectedDevice = null;
      return false;
    }
  }

  /**
   * Setup data listener for incoming messages
   */
  private setupDataListener(): void {
    // Remove existing listener if any
    if (this.readListener) {
      BluetoothSerial.removeListener('read', this.readListener);
    }

    this.readListener = BluetoothSerial.on('read', (data: any) => {
      const receivedData = data.data || '';
      this.dataBuffer += receivedData;

      // Process complete lines (newline-terminated)
      const lines = this.dataBuffer.split('\n');
      this.dataBuffer = lines.pop() || ''; // Keep incomplete line in buffer

      // Process each complete line
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          this.callbacks.onDataReceived?.(trimmedLine);
        }
      });
    });

    // Handle disconnection
    BluetoothSerial.on('connection', (data: any) => {
      if (data.status === 'disconnected') {
        this.isConnected = false;
        this.connectedDevice = null;
        this.callbacks.onDisconnected?.();
      }
    });
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<boolean> {
    try {
      if (this.readListener) {
        BluetoothSerial.removeListener('read', this.readListener);
        this.readListener = null;
      }

      if (this.isConnected) {
        await BluetoothSerial.unpair(this.connectedDevice?.id || '');
      }

      this.isConnected = false;
      this.connectedDevice = null;
      this.dataBuffer = '';
      this.callbacks.onDisconnected?.();
      return true;
    } catch (error: any) {
      console.error('Disconnect error:', error);
      this.isConnected = false;
      this.connectedDevice = null;
      return false;
    }
  }

  /**
   * Send data/command to connected device
   * Commands are newline-terminated strings
   */
  async sendCommand(command: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to any device');
    }

    try {
      // Ensure command ends with newline (firmware expects newline-terminated)
      const commandWithNewline = command.endsWith('\n') ? command : command + '\n';
      await BluetoothSerial.write(commandWithNewline);
      return true;
    } catch (error: any) {
      console.error('Send command error:', error);
      this.callbacks.onError?.(error.message || 'Failed to send command');
      throw error;
    }
  }

  /**
   * Send WiFi configuration to device
   * Format: WIFI_CONFIG:<ssid>:<password>
   */
  async configureWiFi(ssid: string, password: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to any device');
    }

    if (!ssid || ssid.trim().length === 0) {
      throw new Error('WiFi SSID cannot be empty');
    }

    // Format: WIFI_CONFIG:<ssid>:<password>
    const command = `WIFI_CONFIG:${ssid}:${password}`;
    return await this.sendCommand(command);
  }

  /**
   * Parse STATUS response from device
   */
  parseStatusResponse(response: string): DeviceStatus {
    const status: DeviceStatus = {};

    // Parse MAC
    const macMatch = response.match(/MAC:\s*(.+)/);
    if (macMatch) status.mac = macMatch[1].trim();

    // Parse WiFi
    const wifiMatch = response.match(/WiFi:\s*(CONNECTED|DISCONNECTED)/);
    if (wifiMatch) status.wifi = wifiMatch[1] as 'CONNECTED' | 'DISCONNECTED';

    // Parse IP
    const ipMatch = response.match(/IP:\s*(.+)/);
    if (ipMatch) status.ip = ipMatch[1].trim();

    // Parse RSSI
    const rssiMatch = response.match(/RSSI:\s*(.+)\s*dBm/);
    if (rssiMatch) status.rssi = rssiMatch[1].trim();

    // Parse Flash
    const flashMatch = response.match(/Flash:\s*(.+)/);
    if (flashMatch) status.flash = flashMatch[1].trim();

    // Parse GPS
    const gpsMatch = response.match(/GPS:\s*(FIX|NO FIX)/);
    if (gpsMatch) {
      const isValid = gpsMatch[1] === 'FIX';
      status.gps = { valid: isValid };

      if (isValid) {
        const latMatch = response.match(/Lat=([\d.-]+)/);
        const lngMatch = response.match(/Lng=([\d.-]+)/);
        if (latMatch) status.gps.lat = latMatch[1];
        if (lngMatch) status.gps.lng = lngMatch[1];
      }
    }

    return status;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { isConnected: boolean; device: BluetoothDevice | null } {
    return {
      isConnected: this.isConnected,
      device: this.connectedDevice,
    };
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: BluetoothServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.isConnected) {
      await this.disconnect();
    }
    this.callbacks = {};
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();

// Device commands enum
// Note: Only STATUS and WIFI_CONFIG are implemented in firmware
// Other commands may need to be added to firmware
export enum DeviceCommand {
  STATUS = 'STATUS',
  WIFI_CONFIG = 'WIFI_CONFIG',
  // These commands need to be added to firmware
  CHECK_GPS = 'CHECK_GPS', // STATUS already includes GPS info
  VERIFY_WIFI = 'VERIFY_WIFI', // STATUS already includes WiFi info
  RESTART_DEVICE = 'RESTART_DEVICE', // Not in firmware yet
  SHUTDOWN_DEVICE = 'SHUTDOWN_DEVICE', // Not in firmware yet
  FLASH_READ = 'FLASH_READ', // Available in firmware but optional
}


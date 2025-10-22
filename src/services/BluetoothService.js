import { PermissionsAndroid, Platform } from 'react-native';

class BluetoothService {
  constructor() {
    this.isScanning = false;
    this.scannedDevices = new Map();
    this.connectedDevice = null;
    this.isBluetoothEnabled = false;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      return Object.values(granted).every(permission => permission === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  }

  async initializeBluetooth() {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      // Mock Bluetooth enabled for Expo Go
      this.isBluetoothEnabled = true;
      return true;
    } catch (error) {
      console.error('Bluetooth initialization failed:', error);
      this.isBluetoothEnabled = false;
      return false;
    }
  }

  async startScanning(onDeviceFound, onError) {
    try {
      const initialized = await this.initializeBluetooth();
      if (!initialized) {
        onError('Bluetooth initialization failed');
        return;
      }

      if (this.isScanning) {
        return;
      }

      this.isScanning = true;
      this.scannedDevices.clear();

      // Mock devices for demonstration
      const mockDevices = [
        {
          id: 'mock-device-1',
          name: 'Keiros Device GPS-001',
          address: '00:11:22:33:44:55',
          bonded: true,
          lastSeen: new Date(),
        },
        {
          id: 'mock-device-2',
          name: 'Keiros Device GPS-002',
          address: '00:11:22:33:44:66',
          bonded: true,
          lastSeen: new Date(),
        },
        {
          id: 'mock-device-3',
          name: 'ESP32_GPS_BT',
          address: '00:11:22:33:44:77',
          bonded: true,
          lastSeen: new Date(),
        }
      ];

      // Simulate device discovery
      mockDevices.forEach((device, index) => {
        setTimeout(() => {
          this.scannedDevices.set(device.id, device);
          onDeviceFound(device);
        }, index * 1000);
      });

      // Stop scanning after 5 seconds
      setTimeout(() => {
        this.isScanning = false;
      }, 5000);

    } catch (error) {
      this.isScanning = false;
      onError(`Failed to start scanning: ${error.message}`);
    }
  }

  stopScanning() {
    this.isScanning = false;
  }

  isKeirosDevice(deviceName) {
    const keirosKeywords = [
      'Keiros',
      'keiros',
      'KEIROS',
      'ESP32',
      'esp32',
      'ESP-32',
      'ESP32-',
      'GPS_BT',
      'IoT',
      'iot',
      'Device',
      'device'
    ];
    
    return keirosKeywords.some(keyword => 
      deviceName.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async connectToDevice(deviceId, onConnected, onError) {
    try {
      const device = this.scannedDevices.get(deviceId);
      if (!device) {
        onError('Device not found');
        return;
      }

      // Mock connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.connectedDevice = device;
      
      onConnected(this.connectedDevice);
    } catch (error) {
      onError(`Connection failed: ${error.message}`);
    }
  }

  async disconnectDevice() {
    if (this.connectedDevice) {
      try {
        // Mock disconnection
        await new Promise(resolve => setTimeout(resolve, 500));
        this.connectedDevice = null;
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  async sendWiFiConfig(ssid, password, onSuccess, onError) {
    if (!this.connectedDevice) {
      onError('No device connected');
      return;
    }

    try {
      // Mock WiFi configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = `WiFi configuration received!\nSSID: ${ssid}\nStatus: Connected\nIP: 192.168.1.100`;
      
      onSuccess(`WiFi configuration sent successfully!\nSSID: ${ssid}\nResponse: ${mockResponse}`);
    } catch (error) {
      onError(`Failed to send WiFi config: ${error.message}`);
    }
  }

  async sendCommand(command, onResponse, onError) {
    if (!this.connectedDevice) {
      onError('No device connected');
      return;
    }

    try {
      // Mock command response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockResponse = '';
      if (command === 'STATUS') {
        mockResponse = `Device Status:
Name: ${this.connectedDevice.name}
Address: ${this.connectedDevice.address}
WiFi: Connected (SSID: MyWiFi)
GPS: Active (12.3456, 78.9012)
Battery: 85%
Uptime: 2h 15m`;
      } else if (command === 'FLASH_READ') {
        mockResponse = `Flash Data:
GPS Points: 1,247
Storage Used: 2.3MB / 4MB
Last Update: 2024-01-15 14:30:25
Data Format: NMEA`;
      } else {
        mockResponse = `Command received: ${command}\nStatus: OK`;
      }
      
      onResponse(mockResponse);
      
    } catch (error) {
      onError(`Failed to send command: ${error.message}`);
    }
  }

  getScannedDevices() {
    return Array.from(this.scannedDevices.values());
  }

  isDeviceConnected() {
    return this.connectedDevice !== null;
  }

  async isBluetoothEnabled() {
    try {
      // Mock Bluetooth enabled
      return true;
    } catch (error) {
      return false;
    }
  }

  destroy() {
    this.stopScanning();
    this.disconnectDevice();
  }
}

export default new BluetoothService();
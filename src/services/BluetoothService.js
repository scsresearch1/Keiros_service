import { PermissionsAndroid, Platform } from 'react-native';
import BluetoothClassic from 'react-native-bluetooth-classic';

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

      const isEnabled = await BluetoothClassic.isBluetoothEnabled();
      if (!isEnabled) {
        await BluetoothClassic.requestBluetoothEnabled();
      }
      
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

      // Start discovering devices
      const devices = await BluetoothClassic.getBondedDevices();
      
      // Filter for ESP32 devices
      devices.forEach(device => {
        if (this.isESP32Device(device.name)) {
          const deviceInfo = {
            id: device.id,
            name: device.name,
            address: device.address,
            bonded: true,
            lastSeen: new Date(),
          };
          
          this.scannedDevices.set(device.id, deviceInfo);
          onDeviceFound(deviceInfo);
        }
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

  isESP32Device(deviceName) {
    const esp32Keywords = [
      'ESP32',
      'esp32',
      'ESP-32',
      'ESP32-',
      'Keiros',
      'keiros',
      'ESP32_GPS_BT',  // Your device name
      'GPS_BT',
      'IoT',
      'iot',
      'Device',
      'device'
    ];
    
    return esp32Keywords.some(keyword => 
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

      // Connect to the device
      await BluetoothClassic.connectToDevice(device.address);
      this.connectedDevice = device;
      
      onConnected(this.connectedDevice);
    } catch (error) {
      onError(`Connection failed: ${error.message}`);
    }
  }

  async disconnectDevice() {
    if (this.connectedDevice) {
      try {
        await BluetoothClassic.disconnectFromDevice(this.connectedDevice.address);
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
      // Create WiFi configuration command based on your firmware
      const configCommand = `WIFI_CONFIG:${ssid}:${password}`;
      
      // Send the command
      await BluetoothClassic.writeToDevice(this.connectedDevice.address, configCommand);
      
      // Wait a moment for the device to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Read response if available
      const response = await BluetoothClassic.readFromDevice(this.connectedDevice.address);
      
      onSuccess(`WiFi configuration sent successfully. Response: ${response}`);
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
      await BluetoothClassic.writeToDevice(this.connectedDevice.address, command);
      
      // Wait for response
      setTimeout(async () => {
        try {
          const response = await BluetoothClassic.readFromDevice(this.connectedDevice.address);
          onResponse(response);
        } catch (error) {
          onError(`Failed to read response: ${error.message}`);
        }
      }, 1000);
      
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
      return await BluetoothClassic.isBluetoothEnabled();
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

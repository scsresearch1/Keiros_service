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

      // REAL Bluetooth status check
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

      // REAL Bluetooth device scanning - GET ALL DEVICES
      const bondedDevices = await BluetoothClassic.getBondedDevices();
      
      // Add ALL devices found, no filtering
      bondedDevices.forEach(device => {
        const deviceInfo = {
          id: device.id,
          name: device.name || 'Unknown Device',
          address: device.address,
          bonded: true,
          lastSeen: new Date(),
        };
        
        this.scannedDevices.set(device.id, deviceInfo);
        onDeviceFound(deviceInfo);
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

      // REAL Bluetooth connection
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
        // REAL Bluetooth disconnection
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
      // REAL WiFi configuration command
      const configCommand = `WIFI_CONFIG:${ssid}:${password}`;
      
      // Send the command to ESP32
      await BluetoothClassic.writeToDevice(this.connectedDevice.address, configCommand);
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Read response from device
      const response = await BluetoothClassic.readFromDevice(this.connectedDevice.address);
      
      onSuccess(`WiFi configuration sent successfully!\nSSID: ${ssid}\nResponse: ${response}`);
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
      // REAL command sending to ESP32
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
      // REAL Bluetooth status check
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
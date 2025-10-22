import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Provider as PaperProvider, Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from './src/styles/theme';
import BluetoothService from './src/services/BluetoothService';

export default function App() {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'devices', 'config'

  useEffect(() => {
    initializeApp();
    return () => {
      BluetoothService.destroy();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const enabled = await BluetoothService.isBluetoothEnabled();
      setBluetoothEnabled(enabled);
    } catch (error) {
      console.error('Bluetooth status check failed:', error);
      setBluetoothEnabled(false);
    }
  };

  const refreshBluetoothStatus = async () => {
    await initializeApp();
  };

  const startDeviceScan = () => {
    setIsScanning(true);
    setDevices([]);
    
    BluetoothService.startScanning(
      (device) => {
        setDevices(prev => [...prev, device]);
      },
      (error) => {
        Alert.alert('Scan Error', error);
        setIsScanning(false);
      }
    );

    // Stop scanning after 5 seconds
    setTimeout(() => {
      setIsScanning(false);
    }, 5000);
  };

  const connectToDevice = (deviceId) => {
    BluetoothService.connectToDevice(
      deviceId,
      (device) => {
        setConnectedDevice(device);
        setCurrentScreen('config');
        Alert.alert('Connected', `Connected to ${device.name}`);
      },
      (error) => {
        Alert.alert('Connection Error', error);
      }
    );
  };

  const disconnectDevice = () => {
    BluetoothService.disconnectDevice();
    setConnectedDevice(null);
    setCurrentScreen('home');
    Alert.alert('Disconnected', 'Device disconnected');
  };

  const sendWiFiConfig = (ssid, password) => {
    BluetoothService.sendWiFiConfig(
      ssid,
      password,
      (message) => {
        Alert.alert('Success', message);
      },
      (error) => {
        Alert.alert('Error', error);
      }
    );
  };

  const sendCommand = (command) => {
    BluetoothService.sendCommand(
      command,
      (response) => {
        Alert.alert('Response', response);
      },
      (error) => {
        Alert.alert('Error', error);
      }
    );
  };

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bluetooth" size={48} color={theme.colors.primary} />
        <Title style={styles.title}>Keiros Device Management</Title>
        <Paragraph style={styles.subtitle}>
          Professional Keiros Device Control System
        </Paragraph>
      </View>

      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons 
              name={bluetoothEnabled ? "bluetooth" : "bluetooth-off"} 
              size={24} 
              color={bluetoothEnabled ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.statusText}>
              Bluetooth: {bluetoothEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Button
              mode="text"
              onPress={refreshBluetoothStatus}
              style={styles.refreshButton}
              icon="refresh"
            >
              Refresh
            </Button>
          </View>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons 
              name={isScanning ? "loading" : "stop"} 
              size={24} 
              color={isScanning ? theme.colors.warning : theme.colors.text} 
            />
            <Text style={styles.statusText}>
              Scan Status: {isScanning ? 'Scanning...' : 'Ready'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Title>Device Discovery</Title>
          <Paragraph>
            Scan for nearby Keiros devices and manage their WiFi configuration.
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={startDeviceScan}
            disabled={!bluetoothEnabled || isScanning}
            style={styles.scanButton}
            icon="bluetooth"
          >
            {isScanning ? 'Scanning...' : 'Start Device Scan'}
          </Button>

          {devices.length > 0 && (
            <Button
              mode="outlined"
              onPress={() => setCurrentScreen('devices')}
              style={styles.viewDevicesButton}
              icon="devices"
            >
              View Found Devices ({devices.length})
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>System Information</Title>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="devices" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Devices Found: {devices.length}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="wifi" size={20} color={theme.colors.success} />
              <Text style={styles.infoText}>WiFi Config: Ready</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="gps" size={20} color={theme.colors.warning} />
              <Text style={styles.infoText}>GPS Data: Available</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="database" size={20} color={theme.colors.info} />
              <Text style={styles.infoText}>Storage: 2.3MB Used</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderDeviceListScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Discovered Devices</Title>
        <Paragraph style={styles.subtitle}>
          {devices.length} Keiros devices found
        </Paragraph>
      </View>

      {devices.map((device) => (
        <Card key={device.id} style={styles.deviceCard}>
          <Card.Content>
            <View style={styles.deviceHeader}>
              <MaterialCommunityIcons name="devices" size={32} color={theme.colors.primary} />
              <View style={styles.deviceInfo}>
                <Title style={styles.deviceName}>{device.name}</Title>
                <Text style={styles.deviceAddress}>{device.address}</Text>
                <Text style={styles.deviceStatus}>
                  Status: {device.bonded ? 'Paired' : 'Available'}
                </Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={() => connectToDevice(device.id)}
              style={styles.connectButton}
              icon="bluetooth"
            >
              Connect & Configure
            </Button>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="outlined"
        onPress={() => setCurrentScreen('home')}
        style={styles.backButton}
        icon="arrow-left"
      >
        Back to Home
      </Button>
    </ScrollView>
  );

  const renderConfigScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Device Configuration</Title>
        <Paragraph style={styles.subtitle}>
          Connected to: {connectedDevice?.name}
        </Paragraph>
      </View>

      <Card style={styles.configCard}>
        <Card.Content>
          <Title>WiFi Configuration</Title>
          <Paragraph>
            Configure WiFi settings for this Keiros device.
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={() => sendWiFiConfig('MyWiFi', 'password123')}
            style={styles.configButton}
            icon="wifi"
          >
            Configure WiFi (Demo)
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.commandCard}>
        <Card.Content>
          <Title>Device Commands</Title>
          <Paragraph>
            Send commands to the connected device.
          </Paragraph>
          
          <View style={styles.commandButtons}>
            <Button
              mode="outlined"
              onPress={() => sendCommand('STATUS')}
              style={styles.commandButton}
              icon="information-outline"
            >
              Get Status
            </Button>
            <Button
              mode="outlined"
              onPress={() => sendCommand('FLASH_READ')}
              style={styles.commandButton}
              icon="database"
            >
              Read Flash
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={disconnectDevice}
        style={styles.disconnectButton}
        icon="bluetooth-off"
      >
        Disconnect Device
      </Button>
    </ScrollView>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <View style={styles.app}>
        {currentScreen === 'home' && renderHomeScreen()}
        {currentScreen === 'devices' && renderDeviceListScreen()}
        {currentScreen === 'config' && renderConfigScreen()}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  statusCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  refreshButton: {
    marginLeft: 'auto',
  },
  actionCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  scanButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
  },
  viewDevicesButton: {
    marginTop: 12,
    borderColor: theme.colors.primary,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  deviceCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  deviceAddress: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  deviceStatus: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    marginTop: 16,
    borderColor: theme.colors.primary,
  },
  configCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  configButton: {
    marginTop: 16,
    backgroundColor: theme.colors.success,
  },
  commandCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  commandButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  commandButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: theme.colors.primary,
  },
  disconnectButton: {
    marginTop: 16,
    borderColor: theme.colors.error,
  },
});
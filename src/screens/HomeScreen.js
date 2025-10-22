import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Surface,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    checkBluetoothStatus();
    return () => {
      BluetoothService.stopScanning();
    };
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      const enabled = await BluetoothService.isBluetoothEnabled();
      setBluetoothEnabled(enabled);
    } catch (error) {
      console.error('Bluetooth status check failed:', error);
    }
  };

  const startDeviceScan = () => {
    if (!bluetoothEnabled) {
      Alert.alert(
        'Bluetooth Required',
        'Please enable Bluetooth to scan for ESP32 devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsScanning(true);
    setDeviceCount(0);

    BluetoothService.startScanning(
      (device) => {
        setDeviceCount(prev => prev + 1);
      },
      (error) => {
        setIsScanning(false);
        Alert.alert('Scanning Error', error);
      }
    );

    // Stop scanning after 10 seconds
    setTimeout(() => {
      setIsScanning(false);
      BluetoothService.stopScanning();
      navigation.navigate('DeviceList');
    }, 10000);
  };

  const navigateToDeviceList = () => {
    navigation.navigate('DeviceList');
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Keiros Service</Title>
            <Paragraph style={styles.text}>
              Professional ESP32 Device Management System
            </Paragraph>
          </Card.Content>
        </Card>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusContainer}>
            <MaterialIcons 
              name="bluetooth" 
              size={24} 
              color={bluetoothEnabled ? '#4caf50' : '#f44336'} 
            />
            <Text style={styles.statusText}>
              Bluetooth: {bluetoothEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.subtitle}>Device Discovery</Title>
          <Paragraph style={styles.text}>
            Scan for nearby ESP32 devices and configure their WiFi settings.
          </Paragraph>
          
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.statusText}>
                Scanning for ESP32 devices...
              </Text>
              <Text style={styles.statusText}>
                Found {deviceCount} device(s)
              </Text>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={startDeviceScan}
              disabled={!bluetoothEnabled}
              style={styles.button}
              icon="bluetooth-search"
            >
              Start Device Scan
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.subtitle}>Quick Actions</Title>
          <Button
            mode="outlined"
            onPress={navigateToDeviceList}
            style={styles.button}
            icon="devices"
          >
            View Scanned Devices
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.subtitle}>System Information</Title>
          <Paragraph style={styles.text}>
            • ESP32 Device Support: Enabled
          </Paragraph>
          <Paragraph style={styles.text}>
            • WiFi Configuration: Available
          </Paragraph>
          <Paragraph style={styles.text}>
            • Bluetooth Low Energy: Active
          </Paragraph>
          <Paragraph style={styles.text}>
            • Real-time Scanning: Supported
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default HomeScreen;

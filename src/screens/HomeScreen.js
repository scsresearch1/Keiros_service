import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Surface,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

const { width } = Dimensions.get('window');

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
        'Please enable Bluetooth to scan for Keiros devices.',
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Surface style={styles.modernCard}>
        <View style={localStyles.headerContainer}>
          <View style={localStyles.headerContent}>
            <Title style={styles.title}>Keiros Service</Title>
            <Paragraph style={styles.subtitle}>
              Professional Keiros Device Management System
            </Paragraph>
          </View>
          <IconButton
            icon="cog"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => {}}
          />
        </View>
      </Surface>

      {/* Status Card */}
      <Surface style={styles.modernCard}>
        <View style={localStyles.statusContainer}>
          <View style={localStyles.statusItem}>
            <View style={[
              styles.statusIndicator,
              bluetoothEnabled ? styles.connected : styles.disconnected
            ]} />
            <Text style={styles.text}>
              Bluetooth: {bluetoothEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            textStyle={{ fontSize: 12 }}
            style={localStyles.statusChip}
          >
            {deviceCount} Devices Found
          </Chip>
        </View>
      </Surface>

      {/* Device Discovery Card */}
      <Surface style={styles.modernCard}>
        <Title style={styles.subtitle}>Device Discovery</Title>
        <Paragraph style={styles.text}>
          Scan for nearby Keiros devices and configure their WiFi settings.
        </Paragraph>
        
        {isScanning ? (
          <View style={localStyles.scanningContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.statusText}>
              Scanning for Keiros devices...
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
            style={styles.gradientButton}
            icon="bluetooth"
            contentStyle={localStyles.buttonContent}
          >
            Start Device Scan
          </Button>
        )}
      </Surface>

      {/* Quick Actions Card */}
      <Surface style={styles.modernCard}>
        <Title style={styles.subtitle}>Quick Actions</Title>
        <View style={localStyles.actionButtons}>
          <Button
            mode="outlined"
            onPress={navigateToDeviceList}
            style={[styles.button, { flex: 1, marginRight: 8 }]}
            icon="devices"
            contentStyle={localStyles.buttonContent}
          >
            View Devices
          </Button>
          <Button
            mode="outlined"
            onPress={checkBluetoothStatus}
            style={[styles.button, { flex: 1, marginLeft: 8 }]}
            icon="refresh"
            contentStyle={localStyles.buttonContent}
          >
            Refresh
          </Button>
        </View>
      </Surface>

      {/* System Information Card */}
      <Surface style={styles.modernCard}>
        <Title style={styles.subtitle}>System Information</Title>
        <View style={localStyles.infoGrid}>
          <View style={localStyles.infoItem}>
            <MaterialCommunityIcons name="chip" size={24} color="#27ae60" />
            <Text style={styles.text}>Keiros Device Support</Text>
          </View>
          <View style={localStyles.infoItem}>
            <MaterialCommunityIcons name="wifi" size={24} color="#3498db" />
            <Text style={styles.text}>WiFi Configuration</Text>
          </View>
          <View style={localStyles.infoItem}>
            <MaterialCommunityIcons name="bluetooth" size={24} color="#9b59b6" />
            <Text style={styles.text}>Bluetooth Low Energy</Text>
          </View>
          <View style={localStyles.infoItem}>
            <MaterialCommunityIcons name="radar" size={24} color="#e67e22" />
            <Text style={styles.text}>Real-time Scanning</Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    backgroundColor: '#ecf0f1',
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: width * 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
});

export default HomeScreen;
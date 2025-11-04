import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { bluetoothService, BluetoothDevice } from '../utils/bluetoothService';

export default function DeviceDiscoveryScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);

  useEffect(() => {
    checkBluetoothStatus();
    return () => {
      bluetoothService.cleanup();
    };
  }, []);

  const checkBluetoothStatus = async () => {
    const enabled = await bluetoothService.isBluetoothEnabled();
    setBluetoothEnabled(enabled);
    if (!enabled) {
      Alert.alert(
        'Bluetooth Disabled',
        'Please enable Bluetooth to scan for devices',
        [
          {
            text: 'Enable',
            onPress: async () => {
              const success = await bluetoothService.enableBluetooth();
              if (success) {
                setBluetoothEnabled(true);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleScan = async () => {
    if (!bluetoothEnabled) {
      Alert.alert('Error', 'Bluetooth is not enabled');
      return;
    }

    setIsScanning(true);
    setDevices([]);

    bluetoothService.setCallbacks({
      onDeviceFound: (device) => {
        setDevices((prev) => {
          // Avoid duplicates
          if (prev.find((d) => d.id === device.id)) {
            return prev;
          }
          return [...prev, device];
        });
      },
      onError: (error) => {
        Alert.alert('Error', error);
        setIsScanning(false);
      },
    });

    try {
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    try {
      const success = await bluetoothService.connectToDevice(device.id);
      if (success) {
        bluetoothService.setCallbacks({
          onConnected: () => {
            router.push('/device-config');
          },
          onError: (error) => {
            Alert.alert('Connection Error', error);
            setIsConnecting(false);
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to connect to device');
      setIsConnecting(false);
    }
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnect(item)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      {isConnecting && (
        <ActivityIndicator size="small" color="#4A90E2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Device Discovery</Text>
        <Text style={styles.subtitle}>
          Scan for ESP32 devices to connect
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
        onPress={handleScan}
        disabled={isScanning || !bluetoothEnabled}
      >
        {isScanning ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.scanButtonText}>Scanning...</Text>
          </>
        ) : (
          <Text style={styles.scanButtonText}>Scan for Devices</Text>
        )}
      </TouchableOpacity>

      <View style={styles.devicesList}>
        {devices.length === 0 && !isScanning ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No devices found. Tap "Scan for Devices" to search.
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  scanButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  devicesList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  deviceItem: {
    backgroundColor: '#2a2a2a',
    padding: 18,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceAddress: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#aaaaaa',
    fontSize: 16,
    textAlign: 'center',
  },
});


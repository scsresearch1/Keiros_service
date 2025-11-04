import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { bluetoothService, DeviceCommand, DeviceStatus } from '../utils/bluetoothService';

export default function DeviceConfigScreen() {
  const router = useRouter();
  const [connectedDevice, setConnectedDevice] = useState<string>('ESP32_GPS_BT');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [wifiSSID, setWifiSSID] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [statusResponse, setStatusResponse] = useState<string>('');
  const responseBuffer = useRef<string>('');

  useEffect(() => {
    // Initialize Bluetooth service
    bluetoothService.initialize();
    
    // Get connection status
    const status = bluetoothService.getConnectionStatus();
    setIsConnected(status.isConnected);
    if (status.device) {
      setConnectedDevice(status.device.name);
    }
    
    // Set up callbacks
    bluetoothService.setCallbacks({
      onDataReceived: (data) => {
        console.log('Received data:', data);
        responseBuffer.current += data + '\n';
        
        // Check if this is a STATUS response (multi-line)
        if (data.includes('=== STATUS ===') || responseBuffer.current.includes('=== STATUS ===')) {
          // Wait for complete response
          if (!responseBuffer.current.includes('GPS:') && !responseBuffer.current.includes('NO FIX')) {
            return; // Still waiting for more data
          }
          // Parse complete STATUS response
          const parsedStatus = bluetoothService.parseStatusResponse(responseBuffer.current);
          setDeviceStatus(parsedStatus);
          setStatusResponse(responseBuffer.current);
          responseBuffer.current = '';
          setIsLoading(false);
        } else if (data.includes('WIFI_CONFIG OK')) {
          Alert.alert('Success', 'WiFi configuration sent successfully. Device is connecting...');
          setWifiSSID('');
          setWifiPassword('');
          setIsLoading(false);
        } else if (data.includes('ERR:')) {
          Alert.alert('Error', data);
          setIsLoading(false);
        } else if (data.includes('Unknown command')) {
          Alert.alert('Info', 'This command is not yet implemented in the firmware.');
          setIsLoading(false);
        }
      },
      onDisconnected: () => {
        setIsConnected(false);
        Alert.alert('Disconnected', 'Device has been disconnected');
        router.back();
      },
      onError: (error) => {
        Alert.alert('Error', error);
        setIsLoading(false);
      },
    });

    return () => {
      bluetoothService.cleanup();
    };
  }, [router]);

  const handleConfigureWiFi = async () => {
    if (!wifiSSID.trim()) {
      Alert.alert('Error', 'Please enter WiFi SSID');
      return;
    }

    setIsLoading(true);
    responseBuffer.current = '';
    try {
      const success = await bluetoothService.configureWiFi(wifiSSID, wifiPassword);
      // Response will be handled in onDataReceived callback
      if (!success) {
        setIsLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to configure WiFi');
      setIsLoading(false);
    }
  };

  const handleCheckWiFiStatus = async () => {
    setIsLoading(true);
    responseBuffer.current = '';
    setStatusResponse('');
    setDeviceStatus(null);
    try {
      // Use STATUS command which includes WiFi info
      await bluetoothService.sendCommand(DeviceCommand.STATUS);
      // Response will be handled in onDataReceived callback
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check WiFi status');
      setIsLoading(false);
    }
  };

  const handleDeviceCommand = async (command: DeviceCommand) => {
    setIsLoading(true);
    responseBuffer.current = '';
    setStatusResponse('');
    setDeviceStatus(null);

    try {
      // Map commands to firmware commands
      let firmwareCommand = '';
      
      switch (command) {
        case DeviceCommand.STATUS:
          firmwareCommand = 'STATUS';
          break;
        case DeviceCommand.CHECK_GPS:
          // STATUS already includes GPS info
          firmwareCommand = 'STATUS';
          break;
        case DeviceCommand.VERIFY_WIFI:
          // STATUS already includes WiFi info
          firmwareCommand = 'STATUS';
          break;
        case DeviceCommand.RESTART_DEVICE:
          Alert.alert(
            'Not Implemented',
            'RESTART_DEVICE command is not yet implemented in the ESP32 firmware. Please add it to the firmware code.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        case DeviceCommand.SHUTDOWN_DEVICE:
          Alert.alert(
            'Not Implemented',
            'SHUTDOWN_DEVICE command is not yet implemented in the ESP32 firmware. Please add it to the firmware code.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        default:
          firmwareCommand = command;
      }

      await bluetoothService.sendCommand(firmwareCommand);
      // Response will be handled in onDataReceived callback
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to send ${command} command`);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect from the device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await bluetoothService.disconnect();
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to disconnect');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Device Configuration</Text>
          <Text style={styles.subtitle}>Connected to: {connectedDevice}</Text>
        </View>

        {/* WiFi Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WiFi Configuration</Text>
          <Text style={styles.sectionDescription}>
            Configure WiFi settings for this Keiros device.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="WiFi SSID"
              placeholderTextColor="#999"
              value={wifiSSID}
              onChangeText={setWifiSSID}
              autoCapitalize="none"
              editable={isConnected && !isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="WiFi Password"
              placeholderTextColor="#999"
              value={wifiPassword}
              onChangeText={setWifiPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={isConnected && !isLoading}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleConfigureWiFi}
              disabled={!isConnected || isLoading}
            >
              <Text style={styles.buttonIcon}>📶</Text>
              <Text style={styles.primaryButtonText}>Configure WiFi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleCheckWiFiStatus}
              disabled={!isConnected || isLoading}
            >
              <Text style={styles.buttonIcon}>ℹ️</Text>
              <Text style={styles.secondaryButtonText}>Check Status</Text>
            </TouchableOpacity>
          </View>

          {/* Status Display */}
          {statusResponse && deviceStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Device Status:</Text>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>WiFi:</Text>
                <Text style={[
                  styles.statusValue,
                  deviceStatus.wifi === 'CONNECTED' ? styles.statusSuccess : styles.statusError
                ]}>
                  {deviceStatus.wifi || 'Unknown'}
                </Text>
              </View>
              {deviceStatus.ip && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>IP:</Text>
                  <Text style={styles.statusValue}>{deviceStatus.ip}</Text>
                </View>
              )}
              {deviceStatus.rssi && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>RSSI:</Text>
                  <Text style={styles.statusValue}>{deviceStatus.rssi} dBm</Text>
                </View>
              )}
              {deviceStatus.gps && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>GPS:</Text>
                  <Text style={[
                    styles.statusValue,
                    deviceStatus.gps.valid ? styles.statusSuccess : styles.statusError
                  ]}>
                    {deviceStatus.gps.valid 
                      ? `Lat: ${deviceStatus.gps.lat}, Lng: ${deviceStatus.gps.lng}`
                      : 'No Fix'}
                  </Text>
                </View>
              )}
              {deviceStatus.flash && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Flash:</Text>
                  <Text style={[
                    styles.statusValue,
                    deviceStatus.flash === 'OK' ? styles.statusSuccess : styles.statusError
                  ]}>
                    {deviceStatus.flash}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Device Commands Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Commands</Text>
          <Text style={styles.sectionDescription}>
            Send commands to the connected device.
          </Text>

          <View style={styles.commandsGrid}>
            {/* Left Column */}
            <View style={styles.commandColumn}>
              <TouchableOpacity
                style={[styles.commandButton, styles.secondaryButton]}
                onPress={() => handleDeviceCommand(DeviceCommand.STATUS)}
                disabled={!isConnected || isLoading}
              >
                <Text style={styles.commandButtonIcon}>ℹ️</Text>
                <Text style={styles.commandButtonText}>Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.commandButton, styles.secondaryButton]}
                onPress={() => handleDeviceCommand(DeviceCommand.CHECK_GPS)}
                disabled={!isConnected || isLoading}
              >
                <Text style={styles.commandButtonIcon}>📍</Text>
                <Text style={styles.commandButtonText}>Check GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.commandButton, styles.secondaryButton]}
                onPress={() => handleDeviceCommand(DeviceCommand.VERIFY_WIFI)}
                disabled={!isConnected || isLoading}
              >
                <Text style={styles.commandButtonIcon}>✓📶</Text>
                <Text style={styles.commandButtonText}>Verify WiFi</Text>
              </TouchableOpacity>
            </View>

            {/* Right Column */}
            <View style={styles.commandColumn}>
              <TouchableOpacity
                style={[styles.commandButton, styles.dangerButton]}
                onPress={() => handleDeviceCommand(DeviceCommand.RESTART_DEVICE)}
                disabled={!isConnected || isLoading}
              >
                <Text style={styles.commandButtonIcon}>🔄</Text>
                <Text style={styles.commandButtonText}>Restart Device</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.commandButton, styles.dangerButton]}
                onPress={() => handleDeviceCommand(DeviceCommand.SHUTDOWN_DEVICE)}
                disabled={!isConnected || isLoading}
              >
                <Text style={styles.commandButtonIcon}>⏻</Text>
                <Text style={styles.commandButtonText}>Shutdown Device</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Disconnect Button */}
        <TouchableOpacity
          style={[styles.disconnectButton, styles.dangerButton]}
          onPress={handleDisconnect}
          disabled={isLoading}
        >
          <Text style={styles.disconnectButtonIcon}>📱</Text>
          <Text style={styles.disconnectButtonText}>Disconnect Device</Text>
        </TouchableOpacity>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#4A90E2',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderColor: '#E74C3C',
  },
  buttonIcon: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  commandsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  commandColumn: {
    flex: 1,
    gap: 10,
  },
  commandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  commandButtonIcon: {
    fontSize: 18,
  },
  commandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 20,
    gap: 8,
  },
  disconnectButtonIcon: {
    fontSize: 20,
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#aaaaaa',
    fontSize: 14,
    width: 80,
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  statusSuccess: {
    color: '#2ecc71',
  },
  statusError: {
    color: '#E74C3C',
  },
});


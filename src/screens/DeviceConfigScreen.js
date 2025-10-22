import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Surface,
  List,
  Switch,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

const DeviceConfigScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { device } = route.params;

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastCommandResponse, setLastCommandResponse] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);

  useEffect(() => {
    return () => {
      if (isConnected) {
        BluetoothService.disconnectDevice();
      }
    };
  }, []);

  const connectToDevice = async () => {
    setIsConnecting(true);
    setConnectionStatus('Connecting...');

    BluetoothService.connectToDevice(
      device.id,
      (connectedDevice) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('Connected');
        Alert.alert('Success', 'Device connected successfully!');
      },
      (error) => {
        setIsConnecting(false);
        setConnectionStatus('Connection Failed');
        Alert.alert('Connection Error', error);
      }
    );
  };

  const disconnectFromDevice = async () => {
    await BluetoothService.disconnectDevice();
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  };

  const validateWiFiCredentials = () => {
    if (!ssid.trim()) {
      Alert.alert('Validation Error', 'Please enter a WiFi SSID');
      return false;
    }

    if (ssid.length < 2) {
      Alert.alert('Validation Error', 'SSID must be at least 2 characters long');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Validation Error', 'WiFi password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const configureWiFi = async () => {
    if (!validateWiFiCredentials()) {
      return;
    }

    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to the device first');
      return;
    }

    setIsConfiguring(true);
    setConnectionStatus('Configuring WiFi...');

    BluetoothService.sendWiFiConfig(
      ssid.trim(),
      password,
      (successMessage) => {
        setIsConfiguring(false);
        setConnectionStatus('WiFi Configured');
        setLastConfigTime(new Date().toLocaleTimeString());
        Alert.alert(
          'Configuration Success',
          `WiFi settings sent to ${device.name}\n\nSSID: ${ssid}\nTime: ${new Date().toLocaleTimeString()}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally disconnect after successful configuration
                // disconnectFromDevice();
              }
            }
          ]
        );
      },
      (error) => {
        setIsConfiguring(false);
        setConnectionStatus('Configuration Failed');
        Alert.alert('Configuration Error', error);
      }
    );
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected':
        return '#4caf50';
      case 'Connecting...':
      case 'Configuring WiFi...':
        return '#ff9800';
      case 'Connection Failed':
      case 'Configuration Failed':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const sendCommand = async (command) => {
    BluetoothService.sendCommand(
      command,
      (response) => {
        setLastCommandResponse(response);
        setCommandHistory(prev => [...prev, { command, response, timestamp: new Date() }]);
      },
      (error) => {
        setLastCommandResponse(`Error: ${error}`);
        setCommandHistory(prev => [...prev, { command, response: `Error: ${error}`, timestamp: new Date() }]);
      }
    );
  };

  const getDeviceStatus = () => {
    sendCommand('STATUS');
  };

  const readFlashData = () => {
    sendCommand('FLASH_READ');
  };

  const formatDeviceId = (id) => {
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        {/* Device Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.subtitle}>Device Information</Title>
            <List.Item
              title={device.name}
              description={`ID: ${formatDeviceId(device.id)}`}
              left={(props) => (
                <MaterialIcons 
                  {...props} 
                  name="router" 
                  size={32} 
                  color={theme.colors.primary} 
                />
              )}
            />
            <List.Item
              title="Device Address"
              description={device.address}
              left={(props) => (
                <MaterialIcons 
                  {...props} 
                  name="bluetooth" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              )}
            />
            <List.Item
              title="Connection Status"
              description={connectionStatus}
              left={(props) => (
                <MaterialIcons 
                  {...props} 
                  name="bluetooth-connected" 
                  size={24} 
                  color={getConnectionStatusColor()} 
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Connection Control */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.subtitle}>Device Connection</Title>
            
            {isConnecting ? (
              <View style={localStyles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.statusText}>Connecting to device...</Text>
              </View>
            ) : (
              <Button
                mode={isConnected ? "outlined" : "contained"}
                onPress={isConnected ? disconnectFromDevice : connectToDevice}
                style={styles.button}
                icon={isConnected ? "bluetooth-disabled" : "bluetooth"}
              >
                {isConnected ? 'Disconnect' : 'Connect to Device'}
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* WiFi Configuration */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.subtitle}>WiFi Configuration</Title>
            
            <TextInput
              label="WiFi SSID (Network Name)"
              value={ssid}
              onChangeText={setSsid}
              style={styles.inputContainer}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter WiFi network name"
            />

            <TextInput
              label="WiFi Password"
              value={password}
              onChangeText={setPassword}
              style={styles.inputContainer}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter WiFi password"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {isConfiguring ? (
              <View style={localStyles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.statusText}>Sending WiFi configuration...</Text>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={configureWiFi}
                disabled={!isConnected || !ssid.trim() || !password.trim()}
                style={styles.button}
                icon="wifi"
              >
                Configure WiFi
              </Button>
            )}

            {lastConfigTime && (
              <Text style={styles.successText}>
                Last configuration: {lastConfigTime}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Device Commands */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.subtitle}>Device Commands</Title>
            
            <Button
              mode="outlined"
              onPress={getDeviceStatus}
              disabled={!isConnected}
              style={styles.button}
              icon="info"
            >
              Get Device Status
            </Button>

            <Button
              mode="outlined"
              onPress={readFlashData}
              disabled={!isConnected}
              style={styles.button}
              icon="storage"
            >
              Read Flash Data
            </Button>

            {lastCommandResponse && (
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.subtitle}>Last Response</Title>
                  <Text style={styles.text}>{lastCommandResponse}</Text>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        {/* Configuration Guidelines */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.subtitle}>Configuration Guidelines</Title>
            <Text style={styles.text}>
              • Device uses Classic Bluetooth Serial communication
            </Text>
            <Text style={styles.text}>
              • SSID should match your WiFi network name exactly
            </Text>
            <Text style={styles.text}>
              • Password must be at least 8 characters long
            </Text>
            <Text style={styles.text}>
              • Use STATUS command to check device information
            </Text>
            <Text style={styles.text}>
              • Use FLASH_READ command to read stored GPS data
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default DeviceConfigScreen;

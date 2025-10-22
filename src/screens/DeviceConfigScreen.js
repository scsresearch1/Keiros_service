import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
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
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

const { width } = Dimensions.get('window');

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

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected':
        return '#27ae60';
      case 'Connecting...':
      case 'Configuring WiFi...':
        return '#f39c12';
      case 'Connection Failed':
      case 'Configuration Failed':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const formatDeviceId = (id) => {
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Device Information */}
        <Surface style={styles.modernCard}>
          <View style={localStyles.deviceHeader}>
            <MaterialCommunityIcons 
              name="chip" 
              size={40} 
              color={theme.colors.primary} 
            />
            <View style={localStyles.deviceInfo}>
              <Title style={styles.subtitle}>{device.name}</Title>
              <Text style={styles.deviceId}>ID: {formatDeviceId(device.id)}</Text>
              <Text style={styles.deviceId}>MAC: {device.address}</Text>
            </View>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getConnectionStatusColor() }
            ]} />
          </View>
          <Text style={[
            localStyles.statusText,
            { color: getConnectionStatusColor() }
          ]}>
            Status: {connectionStatus}
          </Text>
        </Surface>

        {/* Connection Control */}
        <Surface style={styles.modernCard}>
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
              style={styles.gradientButton}
              icon={isConnected ? "bluetooth-off" : "bluetooth"}
              contentStyle={localStyles.buttonContent}
            >
              {isConnected ? 'Disconnect' : 'Connect to Device'}
            </Button>
          )}
        </Surface>

        {/* WiFi Configuration */}
        <Surface style={styles.modernCard}>
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
            left={<TextInput.Icon icon="wifi" />}
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
            left={<TextInput.Icon icon="lock" />}
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
              style={styles.gradientButton}
              icon="wifi"
              contentStyle={localStyles.buttonContent}
            >
              Configure WiFi
            </Button>
          )}
        </Surface>

        {/* Device Commands */}
        <Surface style={styles.modernCard}>
          <Title style={styles.subtitle}>Device Commands</Title>
          
          <View style={localStyles.commandButtons}>
            <Button
              mode="outlined"
              onPress={getDeviceStatus}
              disabled={!isConnected}
              style={[styles.button, { flex: 1, marginRight: 8 }]}
              icon="information-outline"
              contentStyle={localStyles.buttonContent}
            >
              Status
            </Button>

            <Button
              mode="outlined"
              onPress={readFlashData}
              disabled={!isConnected}
              style={[styles.button, { flex: 1, marginLeft: 8 }]}
              icon="database"
              contentStyle={localStyles.buttonContent}
            >
              Flash Data
            </Button>
          </View>

          {lastCommandResponse && (
            <Surface style={localStyles.responseCard}>
              <Text style={styles.subtitle}>Last Response</Text>
              <Text style={styles.text}>{lastCommandResponse}</Text>
            </Surface>
          )}
        </Surface>

        {/* Configuration Guidelines */}
        <Surface style={styles.modernCard}>
          <Title style={styles.subtitle}>Configuration Guidelines</Title>
          <View style={localStyles.guidelines}>
            <View style={localStyles.guidelineItem}>
              <MaterialCommunityIcons name="bluetooth" size={20} color="#3498db" />
              <Text style={styles.text}>Device uses Classic Bluetooth Serial communication</Text>
            </View>
            <View style={localStyles.guidelineItem}>
              <MaterialCommunityIcons name="wifi" size={20} color="#27ae60" />
              <Text style={styles.text}>SSID should match your WiFi network name exactly</Text>
            </View>
            <View style={localStyles.guidelineItem}>
              <MaterialCommunityIcons name="lock" size={20} color="#e67e22" />
              <Text style={styles.text}>Password must be at least 8 characters long</Text>
            </View>
            <View style={localStyles.guidelineItem}>
              <MaterialCommunityIcons name="information" size={20} color="#9b59b6" />
              <Text style={styles.text}>Use STATUS command to check device information</Text>
            </View>
            <View style={localStyles.guidelineItem}>
              <MaterialCommunityIcons name="database" size={20} color="#e74c3c" />
              <Text style={styles.text}>Use FLASH_READ command to read stored GPS data</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  commandButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  responseCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  guidelines: {
    marginTop: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
});

export default DeviceConfigScreen;
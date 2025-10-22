import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  List,
  Button,
  Text,
  ActivityIndicator,
  Surface,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

const { width } = Dimensions.get('window');

const DeviceListScreen = () => {
  const navigation = useNavigation();
  const [devices, setDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDevices();
    }, [])
  );

  const loadDevices = () => {
    const scannedDevices = BluetoothService.getScannedDevices();
    setDevices(scannedDevices);
  };

  const refreshDevices = () => {
    setIsRefreshing(true);
    loadDevices();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const startNewScan = () => {
    setIsScanning(true);
    setDevices([]);

    BluetoothService.startScanning(
      (device) => {
        setDevices(prev => [...prev, device]);
      },
      (error) => {
        setIsScanning(false);
        Alert.alert('Scanning Error', error);
      }
    );

    setTimeout(() => {
      setIsScanning(false);
      BluetoothService.stopScanning();
    }, 10000);
  };

  const getConnectionStatusColor = (bonded) => {
    return bonded ? '#27ae60' : '#f39c12';
  };

  const getConnectionStatusText = (bonded) => {
    return bonded ? 'Paired' : 'Available';
  };

  const formatDeviceName = (name) => {
    if (!name) return 'Unknown Device';
    return name.length > 20 ? `${name.substring(0, 20)}...` : name;
  };

  const formatDeviceId = (id) => {
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  const renderDeviceItem = ({ item }) => (
    <Surface style={styles.modernCard}>
      <View style={localStyles.deviceItem}>
        <View style={localStyles.deviceInfo}>
          <View style={localStyles.deviceHeader}>
            <MaterialCommunityIcons 
              name="chip" 
              size={32} 
              color={theme.colors.primary} 
            />
            <View style={localStyles.deviceDetails}>
              <Text style={styles.deviceName}>{formatDeviceName(item.name)}</Text>
              <Text style={styles.deviceId}>ID: {formatDeviceId(item.id)}</Text>
              <Text style={styles.deviceId}>MAC: {item.address}</Text>
            </View>
          </View>
          <View style={localStyles.deviceStatus}>
            <Chip 
              mode="outlined" 
              textStyle={{ fontSize: 10 }}
              style={localStyles.statusChip}
            >
              {getConnectionStatusText(item.bonded)}
            </Chip>
            <Text style={[
              localStyles.statusText,
              { color: getConnectionStatusColor(item.bonded) }
            ]}>
              {item.bonded ? '✓ Paired' : '○ Available'}
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('DeviceConfig', { device: item })}
          style={localStyles.connectButton}
          contentStyle={localStyles.buttonContent}
          icon="arrow-right"
        >
          Configure
        </Button>
      </View>
    </Surface>
  );

  const renderEmptyState = () => (
    <Surface style={styles.modernCard}>
      <View style={localStyles.emptyState}>
        <MaterialCommunityIcons 
          name="bluetooth-off" 
          size={64} 
          color="#bdc3c7" 
        />
        <Title style={styles.subtitle}>No Devices Found</Title>
        <Text style={styles.statusText}>
          Start scanning to discover Keiros devices in your area.
        </Text>
        <Button
          mode="contained"
          onPress={startNewScan}
          style={styles.gradientButton}
          icon="bluetooth"
          contentStyle={localStyles.buttonContent}
        >
          Start New Scan
        </Button>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.modernCard}>
        <View style={localStyles.headerContainer}>
          <View style={localStyles.headerContent}>
            <Title style={styles.subtitle}>Keiros Devices</Title>
            <Text style={styles.statusText}>
              {devices.length} device(s) found
            </Text>
          </View>
          <IconButton
            icon="refresh"
            size={24}
            iconColor={theme.colors.primary}
            onPress={refreshDevices}
          />
        </View>
        
        {isScanning && (
          <View style={localStyles.scanningIndicator}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.statusText}>Scanning...</Text>
          </View>
        )}
      </Surface>

      {/* Device List */}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDevices}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={devices.length === 0 ? localStyles.emptyList : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Action Buttons */}
      <Surface style={styles.modernCard}>
        <View style={localStyles.actionButtons}>
          <Button
            mode="outlined"
            onPress={startNewScan}
            disabled={isScanning}
            style={[styles.button, { flex: 1, marginRight: 8 }]}
            icon="refresh"
            contentStyle={localStyles.buttonContent}
          >
            {isScanning ? 'Scanning...' : 'Rescan'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, { flex: 1, marginLeft: 8 }]}
            icon="arrow-left"
            contentStyle={localStyles.buttonContent}
          >
            Back
          </Button>
        </View>
      </Surface>
    </View>
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
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deviceItem: {
    padding: 16,
  },
  deviceInfo: {
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    backgroundColor: '#ecf0f1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default DeviceListScreen;
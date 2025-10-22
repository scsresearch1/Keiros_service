import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
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
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import BluetoothService from '../services/BluetoothService';
import { theme, styles } from '../styles/theme';

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
    return bonded ? '#4caf50' : '#ff9800'; // Green for paired, Orange for available
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
    <Card style={styles.card}>
      <List.Item
        title={formatDeviceName(item.name)}
        description={`ID: ${formatDeviceId(item.id)}`}
        left={(props) => (
          <MaterialIcons 
            {...props} 
            name="router" 
            size={32} 
            color={theme.colors.primary} 
          />
        )}
        right={() => (
          <View style={localStyles.deviceInfo}>
            <Chip 
              mode="outlined" 
              textStyle={{ fontSize: 10 }}
              style={{ marginBottom: 4 }}
            >
              {item.address}
            </Chip>
            <Text style={[
              localStyles.signalText,
              { color: getConnectionStatusColor(item.bonded) }
            ]}>
              {getConnectionStatusText(item.bonded)}
            </Text>
          </View>
        )}
        onPress={() => navigation.navigate('DeviceConfig', { device: item })}
      />
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.card}>
      <Card.Content style={localStyles.emptyState}>
        <MaterialIcons 
          name="bluetooth-disabled" 
          size={64} 
          color="#ccc" 
        />
        <Title style={styles.subtitle}>No Devices Found</Title>
        <Text style={styles.statusText}>
          Start scanning to discover ESP32 devices in your area.
        </Text>
        <Button
          mode="contained"
          onPress={startNewScan}
          style={styles.button}
          icon="bluetooth-search"
        >
          Start New Scan
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Card>
          <Card.Content>
            <View style={localStyles.headerContainer}>
              <Title style={styles.subtitle}>ESP32 Devices</Title>
              <Chip mode="outlined">
                {devices.length} Found
              </Chip>
            </View>
            
            {isScanning && (
              <View style={localStyles.scanningIndicator}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.statusText}>Scanning...</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Surface>

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
      />

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={startNewScan}
            disabled={isScanning}
            style={styles.button}
            icon="refresh"
          >
            {isScanning ? 'Scanning...' : 'Rescan Devices'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const localStyles = StyleSheet.create({
  deviceInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  signalText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default DeviceListScreen;

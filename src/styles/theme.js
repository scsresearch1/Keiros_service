import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a1a2e',
    accent: '#16213e',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    placeholder: '#7f8c8d',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#2c3e50',
    onBackground: '#2c3e50',
    elevation: {
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  },
  roundness: 12,
};

export const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
    color: '#2c3e50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 8,
    color: '#2c3e50',
  },
  statusText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7f8c8d',
    textAlign: 'center',
  },
  deviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  deviceId: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  signalStrength: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4,
  },
  inputContainer: {
    marginVertical: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#27ae60',
    fontSize: 12,
    marginTop: 4,
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#27ae60',
  },
  disconnected: {
    backgroundColor: '#e74c3c',
  },
  scanning: {
    backgroundColor: '#f39c12',
  },
};
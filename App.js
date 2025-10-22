import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import DeviceListScreen from './src/screens/DeviceListScreen';
import DeviceConfigScreen from './src/screens/DeviceConfigScreen';
import { theme } from './src/styles/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1976d2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Keiros Service' }}
          />
          <Stack.Screen 
            name="DeviceList" 
            component={DeviceListScreen} 
            options={{ title: 'Available Devices' }}
          />
          <Stack.Screen 
            name="DeviceConfig" 
            component={DeviceConfigScreen} 
            options={{ title: 'Configure Device' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

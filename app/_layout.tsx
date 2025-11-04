import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Keiros Service App',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="device-discovery" 
          options={{ 
            title: 'Device Discovery',
            headerBackTitle: 'Home',
          }} 
        />
        <Stack.Screen 
          name="device-config" 
          options={{ 
            title: 'Device Configuration',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </>
  );
}

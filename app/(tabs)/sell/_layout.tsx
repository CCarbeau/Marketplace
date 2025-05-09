import { Stack } from 'expo-router/stack';
import { Image } from 'react-native';


export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ 
        headerTitle: '',
        headerTransparent:true
        }} />
        <Stack.Screen name="createListing" options={{ 
        headerTitle: 'Create Listing',
        headerTintColor: '#FF5757',
        headerTitleStyle: {
          color: '#000000'
        }
      }} />
    </Stack>
  );
}
import { Stack } from 'expo-router/stack';
import { Pressable, Image } from 'react-native';
import icons from '@/constants/icons';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ 
        headerTitle: '',
        headerShown: false,
      }} />

      <Stack.Screen name="edit" options={{ 
        headerTitle: 'Edit Profile',
        headerTintColor: '#FF5757',
        headerTitleStyle: {
          color: '#000000'
        }
      }} />
      <Stack.Screen name="menu" options={{ 
        headerTitle: 'Menu',
        headerTintColor: '#FF5757',
        headerTitleStyle: {
          color: '#000000'
        },
        animation: 'slide_from_right',
      }} />
      <Stack.Screen name="notifications" options={({ navigation }) => ({
        headerTitle: 'Notifications',
        headerTintColor: '#FF5757',
        headerTitleStyle: {
          color: '#000000'
        },
        animation: 'slide_from_left',
        headerShown: false,
      })} />
    </Stack>
  );
}
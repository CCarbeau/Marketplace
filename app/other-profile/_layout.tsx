import { Stack } from 'expo-router/stack';
import { Pressable, Image } from 'react-native';
import icons from '@/constants/icons';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ 
        headerTitle: '',
        headerShown: false,
        animation: 'slide_from_right',
      }} />
    </Stack>
  );
}
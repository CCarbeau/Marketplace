import { Stack } from 'expo-router/stack';
import { Image } from 'react-native';

import icons from "../../../constants/icons"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ 
        headerTitle: '',
        headerTransparent:true
        }} />
    </Stack>
  );
}
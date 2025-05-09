import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ 
        headerTitle: '',
        headerShown:false,
        }} />
        <Stack.Screen name="category" options={{ 
        headerTitle: '',
        headerTransparent:true,
        }} />
    </Stack>
  );
}
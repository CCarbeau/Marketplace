import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="[id]" options={{ 
            headerTitle: '',
            headerShown:false
        }} />
        
    </Stack>
  );
}
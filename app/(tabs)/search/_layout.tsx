import { Stack } from 'expo-router/stack';


export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ 
            headerTitle: '',
            headerTransparent:true,
        }} />
        <Stack.Screen name="results" options={{ 
            headerShown: false,
        }} />
        <Stack.Screen name="Section" options={{ 
            headerShown: false,
        }} />
    </Stack>
  );
}
import { Stack } from 'expo-router/stack';
import { AuthProvider } from '../src/auth/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="listing" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
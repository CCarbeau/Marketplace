import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ 
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
      }} />
    </Stack>
  );
}
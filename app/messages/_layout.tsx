import { Stack } from 'expo-router/stack';

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_left',
        }}
      />
    </Stack>
  );
}
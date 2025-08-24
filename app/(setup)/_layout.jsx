// app/(setup)/_layout.jsx
import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="organization-choice" />
      <Stack.Screen name="create-organization" />
      <Stack.Screen name="join-organization" />
    </Stack>
  );
}
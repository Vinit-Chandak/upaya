import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="language" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" options={{ animation: 'fade' }} />
        <Stack.Screen name="chat" />
        <Stack.Screen name="kundli-animation" options={{ animation: 'fade' }} />
        <Stack.Screen name="diagnosis" options={{ animation: 'fade' }} />
        <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom', presentation: 'transparentModal' }} />
        <Stack.Screen name="report" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

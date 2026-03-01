import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@upaya/shared';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.darkTheme.pageBg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="language" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" options={{ animation: 'fade' }} />
        <Stack.Screen name="chat" />
        <Stack.Screen name="kundli-animation" options={{ animation: 'fade' }} />
        <Stack.Screen name="diagnosis" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

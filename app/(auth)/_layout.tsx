import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="onboarding/role-selection" />
      <Stack.Screen name="verification/phone-entry" />
      <Stack.Screen name="verification/otp-verify" />
      <Stack.Screen name="registration/senior" />
      <Stack.Screen name="registration/family" />
      <Stack.Screen name="registration/pal" />
    </Stack>
  );
}

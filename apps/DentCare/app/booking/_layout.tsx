import React from 'react';
import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAF8' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="ticket" />
    </Stack>
  );
}
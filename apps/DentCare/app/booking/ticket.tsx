import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function TicketScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Ticket</Text>
      <Text className="text-base text-gray-500 mt-2">
        Appointment ID: {appointmentId}
      </Text>
      <Text className="text-sm text-gray-400 mt-4 px-8 text-center">
        Full ticket with QR code coming in the next delivery.
      </Text>
    </SafeAreaView>
  );
}
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Track Care</Text>
      <Text className="text-base text-gray-500 mt-2">
        Appointments and health tracking here
      </Text>
    </SafeAreaView>
  );
}
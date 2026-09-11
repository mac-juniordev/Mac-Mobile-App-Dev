import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">DentBot</Text>
      <Text className="text-base text-gray-500 mt-2">
        AI assistant coming here
      </Text>
    </SafeAreaView>
  );
}
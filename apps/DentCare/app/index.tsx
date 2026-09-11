import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/ui/Logo';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      // Check if user is logged in
      const token = await AsyncStorage.getItem('token');
      
      // Wait 3 seconds for splash display
      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      }, 3000);
    } catch (error) {
      console.error('Auth check error:', error);
      setTimeout(() => {
        router.replace('/onboarding');
      }, 3000);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1a1a1a', '#000000', '#0a0a0a']}
        className="absolute inset-0"
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8">
          <View className="items-center mt-16">
            <Logo size={60} showText={false} />
            <Text className="text-white text-2xl font-bold tracking-widest mt-4">
              DENTCARE
            </Text>
            <View className="w-12 h-1 bg-blue-500 rounded-full mt-3" />
          </View>
          <View className="flex-1" />
          <View className="pb-10">
            <Text className="text-white text-4xl font-bold leading-tight mb-4">
              Better care starts{'\n'}with your smile.
            </Text>
            <Text className="text-white/80 text-base mb-8">
              Your trusted dental companion
            </Text>
            <View className="items-center">
              <ActivityIndicator color="#3A86FF" size="small" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
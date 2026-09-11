import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CalendarIcon from './icons/CalendarIcon';
import { theme } from '../../constants/theme';

export default function EmptyAppointmentCard() {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/booking');
        }}
        style={({ pressed }) => ({
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1.5,
          borderColor: '#E5E5E3',
          borderStyle: 'dashed',
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.primary.subtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <CalendarIcon size={30} color={theme.colors.primary.DEFAULT} strokeWidth={2} />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#1F1F1F',
            marginBottom: 6,
          }}
        >
          No upcoming visits
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: '#8A8A8A',
            textAlign: 'center',
            marginBottom: 18,
            lineHeight: 20,
            paddingHorizontal: 12,
          }}
        >
          Book your first checkup and stay on top of your dental health.
        </Text>

        <View
          style={{
            backgroundColor: theme.colors.primary.DEFAULT,
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: 14,
              letterSpacing: 0.3,
            }}
          >
            Book Now
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
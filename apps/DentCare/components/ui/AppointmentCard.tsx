import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  getUrgencyLevel,
} from '../../utils/dateHelpers';
import { useCountdown } from '../../hooks/useCountdown';
import { theme } from '../../constants/theme';

interface Appointment {
  _id: string;
  dentist: {
    _id: string;
    fullName: string;
    specialty: string;
  };
  service: string;
  date: string;
  time: string;
  status: string;
  ticketCode: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  variant?: 'primary' | 'compact';
}

export default function AppointmentCard({
  appointment,
  variant = 'primary',
}: AppointmentCardProps) {
  const router = useRouter();
  const countdown = useCountdown(appointment.date, appointment.time);
  const urgency = getUrgencyLevel(appointment.date, appointment.time);

  // Colors based on urgency
  const urgencyStyles = {
    urgent: {
      bg: '#FEE2E2', // red-100
      border: '#FCA5A5', // red-300
      badgeBg: '#EF4444', // red-500
      badgeText: '#FFFFFF',
      accent: '#DC2626', // red-600
    },
    soon: {
      bg: '#FEF3E2', // amber-50
      border: '#FCD34D', // amber-300
      badgeBg: '#F59E0B', // amber-500
      badgeText: '#FFFFFF',
      accent: '#D97706', // amber-600
    },
    upcoming: {
      bg: theme.colors.primary.subtle,
      border: '#93C5FD', // blue-300
      badgeBg: theme.colors.primary.DEFAULT,
      badgeText: '#FFFFFF',
      accent: theme.colors.primary.dark,
    },
    past: {
      bg: '#F3F4F6', // gray-100
      border: '#D1D5DB', // gray-300
      badgeBg: '#9CA3AF', // gray-400
      badgeText: '#FFFFFF',
      accent: '#6B7280', // gray-500
    },
  };

  const style = urgencyStyles[urgency];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/booking/ticket',
      params: { appointmentId: appointment._id },
    });
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          backgroundColor: style.bg,
          borderWidth: 1,
          borderColor: style.border,
          borderRadius: 20,
          padding: 16,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        })}
      >
        {/* Top row: badge + countdown */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            style={{
              backgroundColor: style.badgeBg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: style.badgeText,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {urgency === 'past' ? 'Missed' : urgency === 'urgent' ? 'Soon' : 'Upcoming'}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: style.accent,
            }}
          >
            {countdown}
          </Text>
        </View>

        {/* Service */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#1F1F1F',
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {appointment.service}
        </Text>

        {/* Dentist */}
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            fontWeight: '500',
            marginBottom: 12,
          }}
          numberOfLines={1}
        >
          {appointment.dentist?.fullName || 'Dentist'}
          {appointment.dentist?.specialty
            ? ` • ${appointment.dentist.specialty}`
            : ''}
        </Text>

        {/* Bottom row: date/time + CTA */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#1F1F1F',
              }}
            >
              {formatAppointmentDate(appointment.date)}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#8A8A8A',
                marginLeft: 6,
              }}
            >
              • {formatAppointmentTime(appointment.time)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: style.accent,
            }}
          >
            View Ticket →
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
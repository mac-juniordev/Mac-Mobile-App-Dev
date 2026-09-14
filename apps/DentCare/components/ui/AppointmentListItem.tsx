import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';

import CheckIcon from './icons/CheckIcon';
import CalendarIcon from './icons/CalendarIcon';
import { theme } from '../../constants/theme';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface Appointment {
  _id: string;
  dentist: {
    _id: string;
    fullName: string;
    specialty: string;
    clinic?: {
      name: string;
      address?: {
        city?: string;
      };
    };
  };
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  ticketCode: string;
  notes?: string;
  estimatedCost?: number;
}

interface AppointmentListItemProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
}

/*
|--------------------------------------------------------------------------
| Status config
|--------------------------------------------------------------------------
*/

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: 'PENDING',
    color: '#D97706',
    bg: '#FEF3E2',
    border: '#FCD34D',
  },
  confirmed: {
    label: 'CONFIRMED',
    color: '#1E5FC9',
    bg: '#E8F1FF',
    border: '#93C5FD',
  },
  completed: {
    label: 'COMPLETED',
    color: '#059669',
    bg: '#E6F7F1',
    border: '#6EE7B7',
  },
  cancelled: {
    label: 'CANCELLED',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#D1D5DB',
  },
  missed: {
    label: 'MISSED',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FCA5A5',
  },
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function AppointmentListItem({
  appointment,
  onCancel,
}: AppointmentListItemProps) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;
  const isUpcoming =
    appointment.status === 'pending' || appointment.status === 'confirmed';
  const isPast =
    appointment.status === 'completed' || appointment.status === 'missed';

  const appointmentDate = dayjs(appointment.date);
  const isToday = appointmentDate.isSame(dayjs(), 'day');
  const isTomorrow = appointmentDate.isSame(dayjs().add(1, 'day'), 'day');
  const dateLabel = isToday
    ? 'Today'
    : isTomorrow
    ? 'Tomorrow'
    : appointmentDate.format('MMM D, YYYY');

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

  const handleViewTicket = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/booking/ticket',
      params: { appointmentId: appointment._id },
    });
  };

  const handleBookAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/booking');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Cancel appointment?',
      `Your ${appointment.service} appointment with ${appointment.dentist.fullName} will be cancelled.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            onCancel?.(appointment._id);
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <Pressable
      onPress={isUpcoming ? handleViewTicket : undefined}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={!isUpcoming}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#EFEFED',
        transform: [{ scale: pressed && isUpcoming ? 0.98 : 1 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Top row: status badge + date */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: status.bg,
            borderWidth: 1,
            borderColor: status.border,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: status.color,
              letterSpacing: 0.5,
            }}
          >
            {status.label}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: isToday
              ? theme.colors.primary.DEFAULT
              : theme.colors.text.secondary,
          }}
        >
          {dateLabel} · {appointment.time}
        </Text>
      </View>

      {/* Service + Dentist */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: 4,
          letterSpacing: -0.2,
        }}
        numberOfLines={1}
      >
        {appointment.service}
      </Text>

      <Text
        style={{
          fontSize: 12,
          color: theme.colors.text.secondary,
          marginBottom: 12,
          fontWeight: '500',
        }}
        numberOfLines={1}
      >
        {appointment.dentist.fullName} · {appointment.dentist.specialty}
      </Text>

      {/* Clinic info */}
      {appointment.dentist.clinic && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <CalendarIcon size={12} color={theme.colors.text.tertiary} />
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.text.tertiary,
              marginLeft: 6,
              fontWeight: '500',
            }}
            numberOfLines={1}
          >
            {appointment.dentist.clinic.name}
            {appointment.dentist.clinic.address?.city
              ? ` · ${appointment.dentist.clinic.address.city}`
              : ''}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {isUpcoming && (
          <>
            <Pressable
              onPress={handleViewTicket}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.colors.primary.DEFAULT,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: 0.2,
                }}
              >
                View Ticket
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCancel}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#DC2626',
                  letterSpacing: 0.2,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </>
        )}

        {isPast && (
          <Pressable
            onPress={handleBookAgain}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: theme.colors.primary.subtle,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.colors.primary.DEFAULT,
                letterSpacing: 0.2,
              }}
            >
              Book Again
            </Text>
          </Pressable>
        )}

        {appointment.status === 'cancelled' && (
          <Pressable
            onPress={handleBookAgain}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: theme.colors.primary.subtle,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.colors.primary.DEFAULT,
                letterSpacing: 0.2,
              }}
            >
              Book Again
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
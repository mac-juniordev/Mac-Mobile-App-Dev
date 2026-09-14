import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import StatCard from '../../components/ui/StatCard';
import AppointmentListItem from '../../components/ui/AppointmentListItem';
import EmptyState from '../../components/ui/EmptyState';
import CalendarIcon from '../../components/ui/icons/CalendarIcon';
import CheckIcon from '../../components/ui/icons/CheckIcon';
import { theme } from '../../constants/theme';
import { appointmentAPI } from '../../utils/axios';
import dayjs from 'dayjs';

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
      address?: { city?: string };
    };
  };
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  ticketCode: string;
  notes?: string;
}

type FilterTab = 'upcoming' | 'completed' | 'missed' | 'all';

/*
|--------------------------------------------------------------------------
| Track Care Screen
|--------------------------------------------------------------------------
*/

export default function TrackScreen() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');

  /*
  |--------------------------------------------------------------------------
  | Load appointments
  |--------------------------------------------------------------------------
  */

  const loadAppointments = useCallback(async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await loadAppointments();
        setLoading(false);
      };
      load();
    }, [loadAppointments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadAppointments();
    setRefreshing(false);
  }, [loadAppointments]);

  /*
  |--------------------------------------------------------------------------
  | Cancel appointment
  |--------------------------------------------------------------------------
  */

  const handleCancel = async (id: string) => {
    try {
      await appointmentAPI.cancel(id);
      await loadAppointments();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Could not cancel appointment.';
      Alert.alert('Error', message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Compute stats
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const now = dayjs();
    let upcoming = 0;
    let missed = 0;
    let completed = 0;

    appointments.forEach((apt) => {
      const aptDate = dayjs(
        `${dayjs(apt.date).format('YYYY-MM-DD')} ${apt.time}`
      );
      if (
        aptDate.isAfter(now) &&
        (apt.status === 'pending' || apt.status === 'confirmed')
      ) {
        upcoming++;
      } else if (apt.status === 'completed') {
        completed++;
      } else if (
        apt.status === 'missed' ||
        (aptDate.isBefore(now) &&
          (apt.status === 'pending' || apt.status === 'confirmed'))
      ) {
        missed++;
      }
    });

    return { upcoming, missed, completed, total: appointments.length };
  }, [appointments]);

  /*
  |--------------------------------------------------------------------------
  | Filter appointments
  |--------------------------------------------------------------------------
  */

  const filteredAppointments = useMemo(() => {
    const now = dayjs();

    const withTime = appointments.map((apt) => ({
      ...apt,
      dateTime: dayjs(
        `${dayjs(apt.date).format('YYYY-MM-DD')} ${apt.time}`
      ),
    }));

    let result = withTime;

    if (activeTab === 'upcoming') {
      result = withTime.filter(
        (apt) =>
          apt.dateTime.isAfter(now) &&
          (apt.status === 'pending' || apt.status === 'confirmed')
      );
    } else if (activeTab === 'completed') {
      result = withTime.filter((apt) => apt.status === 'completed');
    } else if (activeTab === 'missed') {
      result = withTime.filter(
        (apt) =>
          apt.status === 'missed' ||
          (apt.dateTime.isBefore(now) &&
            (apt.status === 'pending' || apt.status === 'confirmed'))
      );
    } else {
      // all
      result = withTime.filter((apt) => apt.status !== 'cancelled');
    }

    return result.sort((a, b) => b.dateTime.valueOf() - a.dateTime.valueOf());
  }, [appointments, activeTab]);

  /*
  |--------------------------------------------------------------------------
  | Empty state content per tab
  |--------------------------------------------------------------------------
  */

  const emptyStateContent = useMemo(() => {
    if (activeTab === 'upcoming') {
      return {
        title: 'No upcoming visits',
        message: 'Book an appointment to see it here.',
        actionLabel: 'Book Now',
      };
    }
    if (activeTab === 'completed') {
      return {
        title: 'No completed visits yet',
        message: 'Your dental history will appear here.',
      };
    }
    if (activeTab === 'missed') {
      return {
        title: 'No missed appointments',
        message: "You're staying on top of your dental care. Keep it up.",
      };
    }
    return {
      title: 'No appointments yet',
      message: 'Book your first visit to get started.',
      actionLabel: 'Book Now',
    };
  }, [activeTab]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.surface.off }}
      edges={['top']}
    >
      {/* HEADER */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          Track Care
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text.secondary,
          }}
        >
          Your complete dental history in one place.
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.DEFAULT}
            colors={[theme.colors.primary.DEFAULT]}
          />
        }
      >
        {/* STATS */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginBottom: 24,
            gap: 10,
          }}
        >
          <StatCard
            value={stats.upcoming}
            label="Upcoming"
            color="#3A86FF"
            bg="#E8F1FF"
          />
          <StatCard
            value={stats.completed}
            label="Completed"
            color="#059669"
            bg="#E6F7F1"
          />
          <StatCard
            value={stats.missed}
            label="Missed"
            color="#DC2626"
            bg="#FEE2E2"
          />
        </View>

        {/* FILTER TABS */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <TabButton
              label="Upcoming"
              count={stats.upcoming}
              active={activeTab === 'upcoming'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('upcoming');
              }}
            />
            <TabButton
              label="Done"
              count={stats.completed}
              active={activeTab === 'completed'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('completed');
              }}
            />
            <TabButton
              label="Missed"
              count={stats.missed}
              active={activeTab === 'missed'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('missed');
              }}
            />
            <TabButton
              label="All"
              count={stats.total}
              active={activeTab === 'all'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('all');
              }}
            />
          </View>
        </View>

        {/* LIST */}
        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <View
              style={{
                paddingVertical: 60,
                alignItems: 'center',
              }}
            >
              <ActivityIndicator color={theme.colors.primary.DEFAULT} />
            </View>
          ) : filteredAppointments.length === 0 ? (
            <EmptyState
              icon={
                <CalendarIcon
                  size={32}
                  color={theme.colors.primary.DEFAULT}
                  strokeWidth={2}
                />
              }
              title={emptyStateContent.title}
              message={emptyStateContent.message}
              actionLabel={emptyStateContent.actionLabel}
              onAction={
                emptyStateContent.actionLabel
                  ? () => router.push('/booking')
                  : undefined
              }
            />
          ) : (
            <View style={{ gap: 12 }}>
              {filteredAppointments.map((apt, index) => (
                <Animated.View
                  key={apt._id}
                  entering={FadeInDown.delay(index * 50).duration(400)}
                >
                  <AppointmentListItem
                    appointment={apt as any}
                    onCancel={handleCancel}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Tab Button
|--------------------------------------------------------------------------
*/

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, count, active, onPress }: TabButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        backgroundColor: active ? '#3A86FF' : 'transparent',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: active ? '700' : '600',
          color: active ? '#FFFFFF' : theme.colors.text.secondary,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>

      {count > 0 && (
        <View
          style={{
            marginLeft: 5,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#F0F0EE',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 5,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: active ? '#FFFFFF' : theme.colors.text.secondary,
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
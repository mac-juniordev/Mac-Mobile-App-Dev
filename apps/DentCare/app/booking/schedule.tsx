import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import ArrowLeftIcon from '../../components/ui/icons/ArrowLeftIcon';
import CheckIcon from '../../components/ui/icons/CheckIcon';
import { theme } from '../../constants/theme';
import { dentistAPI, appointmentAPI } from '../../utils/axios';

const { width } = Dimensions.get('window');

/*
|--------------------------------------------------------------------------
| Calendar locale
|--------------------------------------------------------------------------
*/

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

/*
|--------------------------------------------------------------------------
| Time slots
|--------------------------------------------------------------------------
*/

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

/*
|--------------------------------------------------------------------------
| Step 2 Screen
|--------------------------------------------------------------------------
*/

export default function BookingStepTwo() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    service: string;
    dentistId: string;
  }>();

  const [dentist, setDentist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');
  const maxDate = dayjs().add(60, 'day').format('YYYY-MM-DD');

  /*
  |--------------------------------------------------------------------------
  | Load dentist
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dentistAPI.getById(params.dentistId!);
        setDentist(response.data.dentist);
      } catch (error) {
        console.error('Failed to load dentist:', error);
        Alert.alert('Error', 'Could not load dentist details.');
      } finally {
        setLoading(false);
      }
    };
    if (params.dentistId) load();
  }, [params.dentistId]);

  /*
  |--------------------------------------------------------------------------
  | Confirm booking
  |--------------------------------------------------------------------------
  */

  const canConfirm = !!selectedDate && !!selectedTime;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    try {
      setBooking(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await appointmentAPI.create({
        dentistId: params.dentistId!,
        service: params.service!,
        date: new Date(selectedDate!),
        time: selectedTime!,
        notes: notes.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.replace({
        pathname: '/booking/ticket',
        params: { appointmentId: response.data.appointment._id },
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      const message =
        error.response?.data?.message ||
        'Could not complete booking. Please try again.';
      Alert.alert('Booking Failed', message);
    } finally {
      setBooking(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render — loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface.off,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.primary.DEFAULT} size="large" />
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.off }}>
      {/* HEADER */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.95 : 1 }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            })}
          >
            <ArrowLeftIcon size={20} color={theme.colors.text.primary} />
          </Pressable>

          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: theme.colors.primary.subtle,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: theme.colors.primary.DEFAULT,
                letterSpacing: 0.5,
              }}
            >
              STEP 2 OF 2
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
            marginBottom: 6,
          }}
        >
          Pick a time
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text.secondary,
            lineHeight: 19,
          }}
        >
          Select a date and time that works for you.
        </Text>
      </Animated.View>

      {/* Progress bar */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 20,
          gap: 6,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.primary.DEFAULT,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.primary.DEFAULT,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* SUMMARY CARD */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              borderRadius: 20,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: theme.colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon size={24} color="#FFFFFF" strokeWidth={3} />
            </View>

            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.75)',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                BOOKING SUMMARY
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {params.service}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.85)',
                }}
                numberOfLines={1}
              >
                with {dentist?.fullName}
              </Text>
            </View>
          </View>
        </View>

        {/* CALENDAR */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: theme.colors.primary.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                1
              </Text>
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.text.primary,
                letterSpacing: -0.2,
              }}
            >
              Choose a date
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Calendar
              current={today}
              minDate={today}
              maxDate={maxDate}
              onDayPress={(day: any) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDate(day.dateString);
              }}
              markedDates={
                selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: '#3A86FF',
                        selectedTextColor: '#FFFFFF',
                      },
                    }
                  : {}
              }
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#8A8A8A',
                selectedDayBackgroundColor: '#3A86FF',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#3A86FF',
                dayTextColor: '#1F1F1F',
                textDisabledColor: '#D1D5DB',
                dotColor: '#3A86FF',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#3A86FF',
                monthTextColor: '#1F1F1F',
                textDayFontWeight: '600',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11,
              }}
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        {/* TIME SLOTS */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: selectedDate
                  ? theme.colors.primary.DEFAULT
                  : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                2
              </Text>
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: selectedDate
                  ? theme.colors.text.primary
                  : theme.colors.text.tertiary,
                letterSpacing: -0.2,
              }}
            >
              Choose a time
            </Text>
          </View>

          {!selectedDate ? (
            <View
              style={{
                padding: 24,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#EFEFED',
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Select a date first to see available times.
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {TIME_SLOTS.map((slot) => (
                <TimeSlot
                  key={slot}
                  slot={slot}
                  active={selectedTime === slot}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTime(slot);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* NOTES */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                3
              </Text>
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.text.primary,
                letterSpacing: -0.2,
              }}
            >
              Add a note (optional)
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1.5,
              borderColor: '#EFEFED',
            }}
          >
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe your symptoms or concerns..."
              placeholderTextColor="#B8B8B8"
              multiline
              numberOfLines={4}
              style={{
                fontSize: 14,
                color: theme.colors.text.primary,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0EE',
        }}
      >
        {canConfirm && (
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: '500',
            }}
          >
            {dayjs(selectedDate).format('ddd, MMM D')} · {selectedTime}
          </Text>
        )}

        <Pressable
          onPress={handleConfirm}
          disabled={!canConfirm || booking}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: canConfirm ? '#3A86FF' : '#E5E5E3',
            paddingVertical: 16,
            borderRadius: 999,
            shadowColor: canConfirm ? '#3A86FF' : '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: canConfirm ? 0.35 : 0,
            shadowRadius: 12,
            elevation: canConfirm ? 6 : 0,
          }}
        >
          {booking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text
                style={{
                  color: canConfirm ? '#FFFFFF' : '#8A8A8A',
                  fontWeight: '700',
                  fontSize: 15,
                  letterSpacing: 0.3,
                }}
              >
                Confirm Booking
              </Text>
              {canConfirm && (
                <View style={{ marginLeft: 8 }}>
                  <CheckIcon size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Time Slot — plain object styles, no callback
|--------------------------------------------------------------------------
*/

interface TimeSlotProps {
  slot: string;
  active: boolean;
  onPress: () => void;
}

function TimeSlot({ slot, active, onPress }: TimeSlotProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        width: (width - 40 - 24) / 4,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: active ? '#3A86FF' : '#FFFFFF',
        borderWidth: 1.5,
        borderColor: active ? '#3A86FF' : '#EFEFED',
        alignItems: 'center',
        transform: [{ scale: pressed ? 0.95 : 1 }],
        shadowColor: active ? '#3A86FF' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: active ? 0.25 : 0.03,
        shadowRadius: 5,
        elevation: active ? 3 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: active ? '#FFFFFF' : '#1F1F1F',
        }}
      >
        {slot}
      </Text>
    </Pressable>
  );
}
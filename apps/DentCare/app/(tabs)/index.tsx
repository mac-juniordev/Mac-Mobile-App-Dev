import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  FadeInDown,
  FadeIn,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import NotificationBell from '../../components/ui/NotificationBell';
import BotIcon from '../../components/ui/icons/BotIcon';
import FindIcon from '../../components/ui/icons/FindIcon';
import LightbulbIcon from '../../components/ui/icons/LightbulbIcon';
import AppointmentCard from '../../components/ui/AppointmentCard';
import EmptyAppointmentCard from '../../components/ui/EmptyAppointmentCard';
import { theme } from '../../constants/theme';
import { useUnreadNotifications } from '../../hooks/useNotifications';
import { appointmentAPI } from '../../utils/axios';

const { width } = Dimensions.get('window');

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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
  };
  service: string;
  date: string;
  time: string;
  status: string;
  ticketCode: string;
}

interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
}

type AppointmentTab = 'upcoming' | 'missed' | 'all';

/*
|--------------------------------------------------------------------------
| Dental Tips Library
|--------------------------------------------------------------------------
*/

const DENTAL_TIPS: Tip[] = [
  { id: '1', category: 'Brushing', title: 'Did you know?', content: 'Brushing for 2 minutes, twice a day reduces cavities by up to 40%.' },
  { id: '2', category: 'Brush Care', title: 'Did you know?', content: 'You should replace your toothbrush every 3 to 4 months — or sooner if bristles are frayed.' },
  { id: '3', category: 'Flossing', title: 'Did you know?', content: 'Flossing once a day removes plaque from 40% of your tooth surfaces that brushing misses.' },
  { id: '4', category: 'Diet', title: 'Did you know?', content: 'Cheese raises the pH in your mouth, lowering the risk of tooth decay.' },
  { id: '5', category: 'Hydration', title: 'Did you know?', content: 'Drinking water after meals helps wash away food particles and acid that cause cavities.' },
  { id: '6', category: 'Enamel', title: 'Did you know?', content: 'Tooth enamel is the hardest substance in your body — even stronger than bone.' },
  { id: '7', category: 'Sensitivity', title: 'Did you know?', content: 'Sensitive teeth may mean worn enamel. Ask your dentist about sensitivity toothpaste.' },
  { id: '8', category: 'Gum Health', title: 'Did you know?', content: 'Gum disease is linked to heart disease. Healthy gums support a healthy body.' },
  { id: '9', category: 'Bad Breath', title: 'Did you know?', content: '80% of bad breath comes from bacteria on the tongue — scrape or brush it daily.' },
  { id: '10', category: 'Whitening', title: 'Did you know?', content: 'Strawberries contain malic acid, a natural enamel whitener.' },
  { id: '11', category: 'Kids', title: 'Did you know?', content: 'Children should visit the dentist by their first birthday.' },
  { id: '12', category: 'Checkups', title: 'Did you know?', content: 'Seeing your dentist every 6 months catches problems early.' },
  { id: '13', category: 'Mouthwash', title: 'Did you know?', content: "Mouthwash is not a substitute for brushing — but it reaches areas your brush can't." },
  { id: '14', category: 'Sugar', title: 'Did you know?', content: "It's not how much sugar you eat — it's how often." },
  { id: '15', category: 'Acidity', title: 'Did you know?', content: 'Wait 30 minutes to brush after acidic foods.' },
  { id: '16', category: 'Sleep', title: 'Did you know?', content: 'Grinding your teeth at night can wear down enamel.' },
  { id: '17', category: 'Fluoride', title: 'Did you know?', content: 'Fluoride rebuilds weakened enamel and can reverse early cavities.' },
  { id: '18', category: 'Smoking', title: 'Did you know?', content: 'Smoking doubles your risk of gum disease.' },
  { id: '19', category: 'Pregnancy', title: 'Did you know?', content: 'Pregnancy hormones can make gums more sensitive.' },
  { id: '20', category: 'Brushing', title: 'Did you know?', content: 'Brushing too hard wears down enamel. Gentle circular motions work best.' },
];

/*
|--------------------------------------------------------------------------
| Home Screen
|--------------------------------------------------------------------------
*/

export default function HomeScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');

  const { unreadCount, refresh: refreshNotifications } = useUnreadNotifications();

  const [tipSeed, setTipSeed] = useState(0);

  const currentTip = useMemo<Tip>(() => {
    const randomIndex = Math.floor(Math.random() * DENTAL_TIPS.length);
    return DENTAL_TIPS[randomIndex];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipSeed]);

  const scrollY = useSharedValue(0);

  const loadUserData = useCallback(async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      const fullName = user.fullName || user.name || '';
      const firstName = fullName.trim().split(' ')[0] || 'User';
      setUserName(firstName);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const response = await appointmentAPI.getAll();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadAppointments();
  }, [loadUserData, loadAppointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([loadUserData(), loadAppointments(), refreshNotifications()]);
    setTipSeed((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadUserData, loadAppointments, refreshNotifications]);

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredAppointments = useMemo(() => {
    const now = dayjs();
    const withDateTime = appointments.map((apt) => ({
      ...apt,
      dateTime: dayjs(`${dayjs(apt.date).format('YYYY-MM-DD')} ${apt.time}`),
    }));

    if (activeTab === 'upcoming') {
      return withDateTime
        .filter((apt) => apt.dateTime.isAfter(now) && ['pending', 'confirmed'].includes(apt.status))
        .sort((a, b) => a.dateTime.valueOf() - b.dateTime.valueOf());
    }

    if (activeTab === 'missed') {
      return withDateTime
        .filter((apt) => apt.dateTime.isBefore(now) && ['pending', 'confirmed', 'missed'].includes(apt.status))
        .sort((a, b) => b.dateTime.valueOf() - a.dateTime.valueOf());
    }

    return withDateTime
      .filter((apt) => apt.status !== 'cancelled')
      .sort((a, b) => b.dateTime.valueOf() - a.dateTime.valueOf());
  }, [appointments, activeTab]);

  const counts = useMemo(() => {
    const now = dayjs();
    let upcoming = 0;
    let missed = 0;

    appointments.forEach((apt) => {
      const dateTime = dayjs(`${dayjs(apt.date).format('YYYY-MM-DD')} ${apt.time}`);
      if (dateTime.isAfter(now) && ['pending', 'confirmed'].includes(apt.status)) {
        upcoming++;
      } else if (dateTime.isBefore(now) && ['pending', 'confirmed', 'missed'].includes(apt.status)) {
        missed++;
      }
    });

    return {
      upcoming,
      missed,
      all: appointments.filter((a) => a.status !== 'cancelled').length,
    };
  }, [appointments]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroParallax = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 200], [0, -30], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
  });

  const handleSearch = () => {
    const query = searchQuery.trim();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (query.length > 0) {
      router.push({ pathname: '/(tabs)/search', params: { query } });
      return;
    }
    router.push('/(tabs)/search');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface.off }}>
      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
        {/* ============================================
            GRADIENT HEADER
        ============================================ */}

        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={['#3A86FF', '#5A56FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: 60,
              paddingBottom: 32,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -20,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />

            {/* Brand title + bell */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 26,
                  fontWeight: '800',
                  letterSpacing: 2,
                }}
              >
                DENTCARE
              </Text>

              <NotificationBell unreadCount={unreadCount} light />
            </View>

            {/* Greeting */}
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: 0.3,
                marginBottom: 4,
              }}
            >
              {getGreeting()},
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: '700',
                letterSpacing: -0.5,
                marginBottom: 22,
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>

            {/* Search bar */}
            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 14,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 4,
              })}
            >
              <FindIcon size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 15,
                  color: theme.colors.text.primary,
                }}
                placeholder="Search dentists, services..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ============================================
            APPOINTMENTS SECTION (below gradient)
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{ paddingHorizontal: 20, marginTop: 24 }}
        >
          {/* Segmented control */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 4,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <SegmentButton
              label="Upcoming"
              count={counts.upcoming}
              active={activeTab === 'upcoming'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('upcoming');
              }}
            />
            <SegmentButton
              label="Missed"
              count={counts.missed}
              active={activeTab === 'missed'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('missed');
              }}
            />
            <SegmentButton
              label="All"
              count={counts.all}
              active={activeTab === 'all'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('all');
              }}
            />
          </View>

          {/* Appointments */}
          {loadingAppointments ? (
            <View
              style={{
                paddingVertical: 40,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
              }}
            >
              <ActivityIndicator color={theme.colors.primary.DEFAULT} />
            </View>
          ) : filteredAppointments.length === 0 ? (
            activeTab === 'upcoming' ? (
              <EmptyAppointmentCard />
            ) : (
              <View
                style={{
                  paddingVertical: 32,
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.secondary,
                    fontWeight: '500',
                  }}
                >
                  {activeTab === 'missed' ? 'No missed appointments' : 'No appointments yet'}
                </Text>
              </View>
            )
          ) : (
            <View style={{ gap: 12 }}>
              {filteredAppointments.map((apt) => (
                <AppointmentCard key={apt._id} appointment={apt} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ============================================
            DENTBOT — compact row card
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[{ paddingHorizontal: 20, marginTop: 24 }, heroParallax]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/ai');
            }}
            style={({ pressed }) => ({
              borderRadius: 20,
              overflow: 'hidden',
              transform: [{ scale: pressed ? 0.98 : 1 }],
              shadowColor: theme.colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 6,
            })}
          >
            <LinearGradient
              colors={['#3A86FF', '#5A56FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Decorative circle */}
              <View
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              />

              {/* Icon */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BotIcon size={28} color="#FFFFFF" />
              </View>

              {/* Text */}
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: 17,
                      letterSpacing: -0.2,
                    }}
                  >
                    DentBot
                  </Text>
                  <View
                    style={{
                      marginLeft: 8,
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontWeight: '700',
                        letterSpacing: 0.5,
                      }}
                    >
                      AI
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 12,
                  }}
                  numberOfLines={1}
                >
                  Ask me anything about your dental health
                </Text>
              </View>

              {/* Arrow */}
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                    marginTop: -1,
                  }}
                >
                  →
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ============================================
            DAILY TIP
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={{ paddingHorizontal: 20, marginTop: 24 }}
        >
          <TipCard tip={currentTip} />
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Segment Button
|--------------------------------------------------------------------------
*/

interface SegmentButtonProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

function SegmentButton({ label, count, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: active ? theme.colors.primary.DEFAULT : 'transparent',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          fontSize: 13,
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
            marginLeft: 6,
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

/*
|--------------------------------------------------------------------------
| Tip Card
|--------------------------------------------------------------------------
*/

interface TipCardProps {
  tip: Tip;
}

function TipCard({ tip }: TipCardProps) {
  return (
    <View
      style={{
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={['#FFF4E6', '#FFE4CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 22, position: 'relative' }}
      >
        <View
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 140, 66, 0.12)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -20,
            left: 40,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255, 140, 66, 0.08)',
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: 'rgba(255, 140, 66, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LightbulbIcon size={22} color="#FF8C42" strokeWidth={2.5} />
          </View>

          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: '#FF8C42',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              {tip.category}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#1F1F1F',
                marginTop: 3,
                letterSpacing: -0.2,
              }}
            >
              {tip.title}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            lineHeight: 22,
            color: '#1F1F1F',
            fontWeight: '500',
          }}
        >
          {tip.content}
        </Text>
      </LinearGradient>
    </View>
  );
}
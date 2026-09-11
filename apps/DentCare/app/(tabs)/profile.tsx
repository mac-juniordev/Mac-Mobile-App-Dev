import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import CameraIcon from '../../components/ui/icons/CameraIcon';
import BookIcon from '../../components/ui/icons/BookIcon';
import TrackIcon from '../../components/ui/icons/TrackIcon';
import ChartIcon from '../../components/ui/icons/ChartIcon';
import BellIcon from '../../components/ui/icons/BellIcon';
import ProfileIcon from '../../components/ui/icons/ProfileIcon';
import { theme } from '../../constants/theme';
import { authAPI, appointmentAPI } from '../../utils/axios';

const { width } = Dimensions.get('window');

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
}

interface AppointmentStats {
  upcoming: number;
  missed: number;
  completed: number;
  total: number;
}

/*
|--------------------------------------------------------------------------
| Profile Screen
|--------------------------------------------------------------------------
*/

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AppointmentStats>({
    upcoming: 0,
    missed: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load profile
  |--------------------------------------------------------------------------
  */

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setUser(JSON.parse(userString));
      }

      const [userResponse, statsResponse] = await Promise.all([
        authAPI.getCurrentUser(),
        appointmentAPI.getStats(),
      ]);

      setUser(userResponse.data.user);
      setStats(statsResponse.data.stats);
      await AsyncStorage.setItem('user', JSON.stringify(userResponse.data.user));
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /*
  |--------------------------------------------------------------------------
  | Photo picker
  |--------------------------------------------------------------------------
  */

  const pickFromLibrary = async () => {
    setShowPhotoOptions(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'DentCare needs access to your photos to update your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setShowPhotoOptions(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'DentCare needs access to your camera to take a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await authAPI.uploadProfilePicture(uri);
      const newUrl = response.data.profilePicture;

      if (user) {
        const updated = { ...user, profilePicture: newUrl };
        setUser(updated);
        await AsyncStorage.setItem('user', JSON.stringify(updated));
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload picture';
      Alert.alert('Error', message);
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of DentCare?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await authAPI.logout();
            } catch {}
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Derived
  |--------------------------------------------------------------------------
  */

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format('MMM YYYY')
    : '';

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-surface-off items-center justify-center">
        <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface.off }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ============================================
            HERO HEADER with gradient
        ============================================ */}

        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={['#3A86FF', '#5A56FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: 60,
              paddingBottom: 80,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            {/* Header title */}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              My Profile
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 13,
              }}
            >
              Manage your account and preferences
            </Text>

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
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />
          </LinearGradient>
        </Animated.View>

        {/* ============================================
            AVATAR overlapping the gradient
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{
            alignItems: 'center',
            marginTop: -60,
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPhotoOptions(true);
            }}
            disabled={uploading}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.primary.subtle,
                borderWidth: 5,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {uploading ? (
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary.DEFAULT}
                />
              ) : user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: '700',
                    color: theme.colors.primary.DEFAULT,
                  }}
                >
                  {initials}
                </Text>
              )}
            </View>

            {/* Camera badge */}
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.primary.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: '#FFFFFF',
              }}
            >
              <CameraIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </Pressable>

          {/* Name and email */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginTop: 16,
            }}
            numberOfLines={1}
          >
            {user?.fullName || 'User'}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text.secondary,
              marginTop: 4,
            }}
          >
            {user?.email || ''}
          </Text>

          {/* Member badge */}
          {memberSince && (
            <View
              style={{
                marginTop: 12,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: theme.colors.primary.subtle,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: theme.colors.primary.DEFAULT,
                  letterSpacing: 0.3,
                }}
              >
                MEMBER SINCE {memberSince.toUpperCase()}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ============================================
            STATS GRID
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginTop: 32,
            gap: 10,
          }}
        >
          <StatCard
            value={stats.upcoming}
            label="Upcoming"
            color={theme.colors.primary.DEFAULT}
            bg={theme.colors.primary.subtle}
          />
          <StatCard
            value={stats.missed}
            label="Missed"
            color="#DC2626"
            bg="#FEE2E2"
          />
          <StatCard
            value={stats.completed}
            label="Completed"
            color="#10B981"
            bg="#E6F7F1"
          />
        </Animated.View>

        {/* ============================================
            APPOINTMENTS SECTION
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={{ marginTop: 32, paddingHorizontal: 20 }}
        >
          <SectionHeader title="My Appointments" />

          <View style={{ gap: 12 }}>
            <CardRow
              Icon={BookIcon}
              iconColor="#3A86FF"
              iconBg="#E8F1FF"
              title="Upcoming Visits"
              subtitle={`${stats.upcoming} scheduled`}
              onPress={() => router.push('/(tabs)/track')}
            />
            <CardRow
              Icon={TrackIcon}
              iconColor="#FF8C42"
              iconBg="#FFF0E6"
              title="Appointment History"
              subtitle={`${stats.total} total visits`}
              onPress={() => router.push('/(tabs)/track')}
            />
            <CardRow
              Icon={ChartIcon}
              iconColor="#10B981"
              iconBg="#E6F7F1"
              title="Treatment Records"
              subtitle="Procedures and notes"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* ============================================
            ACCOUNT SECTION
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={{ marginTop: 28, paddingHorizontal: 20 }}
        >
          <SectionHeader title="Account" />

          <View style={{ gap: 12 }}>
            <CardRow
              Icon={ProfileIcon}
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="Personal Information"
              subtitle="Name, email, phone"
              onPress={() => {}}
            />
            <CardRow
              Icon={BellIcon}
              iconColor="#F59E0B"
              iconBg="#FEF3E2"
              title="Notifications"
              subtitle="Reminders and alerts"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* ============================================
            LOGOUT
        ============================================ */}

        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={{ marginTop: 32, paddingHorizontal: 20 }}
        >
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#FECACA',
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text
              style={{
                color: '#DC2626',
                fontWeight: '700',
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              LOG OUT
            </Text>
          </Pressable>
        </Animated.View>

        {/* ============================================
            VERSION
        ============================================ */}

        <Text
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: theme.colors.text.tertiary,
            marginTop: 24,
            letterSpacing: 0.5,
          }}
        >
          DentCare • v1.0.0
        </Text>
      </ScrollView>

      {/* ============================================
          PHOTO OPTIONS MODAL
      ============================================ */}

      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <Pressable
          onPress={() => setShowPhotoOptions(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#E5E5E3',
                alignSelf: 'center',
                marginBottom: 24,
              }}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#1F1F1F',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Change Profile Photo
            </Text>

            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.primary.DEFAULT,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 12,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                Take Photo
              </Text>
            </Pressable>

            <Pressable
              onPress={pickFromLibrary}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.primary.subtle,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 12,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text
                style={{
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                Choose from Library
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPhotoOptions(false)}
              style={({ pressed }) => ({
                paddingVertical: 14,
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text
                style={{
                  color: '#8A8A8A',
                  fontWeight: '600',
                  fontSize: 15,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 12,
        letterSpacing: 0.2,
      }}
    >
      {title}
    </Text>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

interface StatCardProps {
  value: number;
  label: string;
  color: string;
  bg: string;
}

function StatCard({ value, label, color, bg }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color,
          }}
        >
          {value}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 11,
          color: theme.colors.text.secondary,
          fontWeight: '600',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Card Row
|--------------------------------------------------------------------------
*/

interface CardRowProps {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function CardRow({
  Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
}: CardRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ scale: pressed ? 0.985 : 1 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      })}
    >
      {/* Icon bubble */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={iconColor} />
      </View>

      {/* Text */}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
            marginTop: 3,
          }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {/* Chevron */}
      <Text
        style={{
          fontSize: 22,
          color: '#C8C8C8',
          marginLeft: 8,
          fontWeight: '300',
        }}
      >
        ›
      </Text>
    </Pressable>
  );
}
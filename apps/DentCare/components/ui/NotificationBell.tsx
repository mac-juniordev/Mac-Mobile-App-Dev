import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BellIcon from './icons/BellIcon';
import { theme } from '../../constants/theme';

interface NotificationBellProps {
  unreadCount: number;
  light?: boolean;
}

export default function NotificationBell({
  unreadCount,
  light = false,
}: NotificationBellProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notifications');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: light ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.95 : 1 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: light ? 0 : 0.06,
        shadowRadius: 4,
        elevation: light ? 0 : 2,
      })}
    >
      <BellIcon size={22} color={light ? '#FFFFFF' : theme.colors.text.primary} />

      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: light ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
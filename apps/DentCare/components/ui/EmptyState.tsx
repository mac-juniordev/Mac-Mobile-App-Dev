import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#EFEFED',
        borderStyle: 'dashed',
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: theme.colors.primary.subtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {icon}
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: actionLabel ? 20 : 0,
          paddingHorizontal: 8,
        }}
      >
        {message}
      </Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction();
          }}
          style={{
            backgroundColor: theme.colors.primary.DEFAULT,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: 13,
              letterSpacing: 0.3,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
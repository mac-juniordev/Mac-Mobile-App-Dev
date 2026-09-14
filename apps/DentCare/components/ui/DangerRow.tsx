import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';

interface DangerRowProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
  variant?: 'default' | 'solid';
}

export default function DangerRow({
  title,
  subtitle,
  actionLabel,
  onPress,
  variant = 'default',
}: DangerRowProps) {
  const [pressed, setPressed] = useState(false);

  const isSolid = variant === 'solid';

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginBottom: 8,
      }}
    >
      {/* Text block */}
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 3,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: theme.colors.text.secondary,
            fontWeight: '500',
            lineHeight: 16,
          }}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>

      {/* Action button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 10,
          borderWidth: isSolid ? 0 : 1.5,
          borderColor: '#FECACA',
          backgroundColor: isSolid ? '#DC2626' : 'transparent',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: isSolid ? '#FFFFFF' : '#DC2626',
            letterSpacing: 0.2,
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
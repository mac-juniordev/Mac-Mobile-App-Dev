import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../constants/theme';

interface StatCardProps {
  value: number;
  label: string;
  color: string;
  bg: string;
}

export default function StatCard({ value, label, color, bg }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 16,
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
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 18,
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
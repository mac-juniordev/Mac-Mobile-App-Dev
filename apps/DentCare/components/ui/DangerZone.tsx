import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../constants/theme';

interface DangerZoneProps {
  children: React.ReactNode;
}

export default function DangerZone({ children }: DangerZoneProps) {
  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: '#FECACA',
        borderRadius: 22,
        backgroundColor: '#FEF2F2',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#FEE2E2',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* Warning dot */}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#DC2626',
            marginRight: 10,
          }}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '800',
            color: '#DC2626',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Danger Zone
        </Text>
      </View>

      {/* Content */}
      <View style={{ padding: 12 }}>{children}</View>
    </View>
  );
}
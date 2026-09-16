import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../constants/theme';

interface MessageBubbleProps {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export default function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <View
      style={{
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 4,
      }}
    >
      {/* Label */}
      {!isUser && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
            marginLeft: 4,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.primary.DEFAULT,
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: theme.colors.primary.DEFAULT,
              letterSpacing: 0.5,
            }}
          >
            DENTBOT
          </Text>
        </View>
      )}

      {/* Bubble */}
      <View
        style={{
          maxWidth: '85%',
          backgroundColor: isUser ? '#3A86FF' : '#FFFFFF',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 20,
          borderBottomRightRadius: isUser ? 6 : 20,
          borderBottomLeftRadius: isUser ? 20 : 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isUser ? 0.15 : 0.05,
          shadowRadius: 6,
          elevation: isUser ? 3 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            lineHeight: 21,
            color: isUser ? '#FFFFFF' : theme.colors.text.primary,
            fontWeight: '500',
          }}
        >
          {content}
        </Text>
      </View>

      {/* Timestamp */}
      {timestamp && (
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.text.tertiary,
            marginTop: 4,
            marginHorizontal: 6,
          }}
        >
          {timestamp}
        </Text>
      )}
    </View>
  );
}
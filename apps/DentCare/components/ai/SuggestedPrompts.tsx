import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import BotIcon from '../ui/icons/BotIcon';
import { theme } from '../../constants/theme';

const PROMPTS = [
  'What causes tooth sensitivity?',
  'How often should I floss?',
  'Is teeth whitening safe?',
  'How do I know if I have a cavity?',
  'What foods are bad for my teeth?',
  'How can I stop bleeding gums?',
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <View style={{ paddingVertical: 24 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        {/* Bot icon in blue */}
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
          <BotIcon size={40} color={theme.colors.primary.DEFAULT} strokeWidth={2} />
        </View>

        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Hi, I'm DentBot
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            paddingHorizontal: 40,
            lineHeight: 19,
          }}
        >
          Ask me anything about your dental health. Try one of these to get
          started.
        </Text>
      </View>

      {/* Prompts */}
      <View style={{ gap: 8 }}>
        {PROMPTS.map((prompt, index) => (
          <PromptChip
            key={index}
            prompt={prompt}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(prompt);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function PromptChip({
  prompt,
  onPress,
}: {
  prompt: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#EFEFED',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text.primary,
          flex: 1,
        }}
      >
        {prompt}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: theme.colors.primary.DEFAULT,
          fontWeight: '600',
          marginLeft: 8,
        }}
      >
        →
      </Text>
    </Pressable>
  );
}
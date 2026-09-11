import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = () => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return score;
  };

  const strength = getStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3A86FF', '#10B981'];

  if (!password) return null;

  return (
    <View className="mb-4">
      {/* Strength bars */}
      <View className="flex-row" style={{ gap: 6 }}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            className="flex-1 rounded-full"
            style={{
              height: 4,
              backgroundColor: level <= strength ? strengthColors[strength] : '#E5E5E3',
            }}
          />
        ))}
      </View>

      {/* Strength label */}
      <Text
        className="text-xs mt-2"
        style={{ color: strengthColors[strength] }}
      >
        Password strength: {strengthLabels[strength]}
      </Text>

      {/* Requirements checklist */}
      <View className="mt-3" style={{ gap: 6 }}>
        <RequirementItem
          met={password.length >= 8}
          text="At least 8 characters"
        />
        <RequirementItem
          met={/[A-Z]/.test(password)}
          text="One uppercase letter"
        />
        <RequirementItem
          met={/[0-9]/.test(password)}
          text="One number"
        />
        <RequirementItem
          met={/[^A-Za-z0-9]/.test(password)}
          text="One special character"
        />
      </View>
    </View>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View className="flex-row items-center">
      <View
        className="w-4 h-4 rounded-full items-center justify-center mr-2"
        style={{
          backgroundColor: met ? '#10B981' : '#E5E5E3',
        }}
      >
        <Text className="text-white text-xs font-bold">
          {met ? '✓' : ''}
        </Text>
      </View>
      <Text
        className="text-xs"
        style={{ color: met ? '#10B981' : '#8A8A8A' }}
      >
        {text}
      </Text>
    </View>
  );
}
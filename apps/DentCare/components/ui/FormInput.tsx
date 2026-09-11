import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { theme } from '../../constants/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
}

export default function FormInput({
  label,
  error,
  isPassword = false,
  rightIcon,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </Text>

      {/* Input Container */}
      <View
        className={`flex-row items-center rounded-xl border px-4 ${
          isFocused ? 'border-blue-500' : 'border-gray-300'
        } ${error ? 'border-red-500' : ''}`}
        style={{
          backgroundColor: isFocused ? '#F8FAFF' : '#FFFFFF',
          height: 52,
        }}
      >
        <TextInput
          className="flex-1 text-base text-gray-900"
          placeholderTextColor="#B8B8B8"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-2"
          >
            <Text className="text-gray-500 text-sm">
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Custom right icon */}
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>

      {/* Error message */}
      {error && (
        <Text className="text-red-500 text-xs mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
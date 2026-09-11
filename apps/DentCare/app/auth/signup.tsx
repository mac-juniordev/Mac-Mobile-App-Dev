import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../components/ui/Logo';
import FormInput from '../../components/ui/FormInput';
import PasswordStrength from '../../components/ui/PasswordStrength';
import { theme } from '../../constants/theme';
import { authAPI } from '../../utils/axios';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSignUp = async () => {
    console.log('=== SIGNUP STARTED ===');
    console.log('Form data:', { fullName, email, password: '***' });

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, sending to backend...');
    setIsLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      console.log('Payload being sent:', payload);

      const response = await authAPI.register(payload);

      console.log('=== SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.log('=== SIGNUP ERROR ===');
      console.log('Error object:', error);
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error status:', error.response?.status);
      console.log('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Error config URL:', error.config?.url);
      console.log('Error config baseURL:', error.config?.baseURL);
      console.log('Error config method:', error.config?.method);
      console.log('====================');

      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';

      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: Platform.OS === 'ios' ? 120 : 150,
          }}
        >
          <View className="items-center mb-8">
            <Logo size={48} showText={false} />
            <Text className="text-2xl font-bold text-gray-900 mt-4">
              Create your account
            </Text>
            <Text className="text-base text-gray-500 mt-2 text-center">
              Join DentCare and take control of your dental health
            </Text>
          </View>

          <View>
            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              editable={!isLoading}
            />

            <FormInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              editable={!isLoading}
            />

            <FormInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              returnKeyType="next"
              editable={!isLoading}
            />

            {password.length > 0 && <PasswordStrength password={password} />}

            <FormInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            className="rounded-full py-4 items-center mt-4"
            style={{
              backgroundColor: isLoading ? '#B8B8B8' : theme.colors.primary.DEFAULT,
              shadowColor: theme.colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-sm">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text className="text-blue-500 font-semibold text-sm">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-xs text-gray-400 mt-6">
            By creating an account, you agree to our{' '}
            <Text className="text-blue-500">Terms of Service</Text> and{' '}
            <Text className="text-blue-500">Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
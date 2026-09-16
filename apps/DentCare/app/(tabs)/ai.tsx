import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';

import MessageBubble from '../../components/ai/MessageBubble';
import TypingIndicator from '../../components/ai/TypingIndicator';
import SuggestedPrompts from '../../components/ai/SuggestedPrompts';
import ArrowRightIcon from '../../components/ui/icons/ArrowRightIcon';
import { theme } from '../../constants/theme';
import { aiAPI } from '../../utils/aiApi';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  /*
  |--------------------------------------------------------------------------
  | Load conversation history on focus
  |--------------------------------------------------------------------------
  */

  const loadHistory = useCallback(async () => {
    try {
      const res = await aiAPI.getConversation();
      const history = res.data.conversation?.messages || [];
      setMessages(
        history.map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  /*
  |--------------------------------------------------------------------------
  | Scroll to bottom on new message
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chat(trimmed);
      const botMessage: Message = {
        role: 'model',
        content: res.data.response,
      };
      setMessages((prev) => [...prev, botMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg =
        error.response?.data?.message ||
        'DentBot could not respond. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: errorMsg,
        },
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTyping(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Clear conversation
  |--------------------------------------------------------------------------
  */

  const handleClear = () => {
    if (messages.length === 0) return;
    Alert.alert(
      'Start fresh?',
      'This will clear your conversation with DentBot.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await aiAPI.clearConversation();
              setMessages([]);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error('Clear error:', error);
            }
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.surface.off }}
      edges={['top']}
    >
      {/* HEADER */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0EE',
          backgroundColor: '#FFFFFF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.primary.DEFAULT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '800',
              }}
            >
              D
            </Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.text.primary,
                letterSpacing: -0.2,
              }}
            >
              DentBot
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#10B981',
                  marginRight: 5,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.text.secondary,
                  fontWeight: '500',
                }}
              >
                Online
              </Text>
            </View>
          </View>
        </View>

        {messages.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: '#F5F5F3',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.text.secondary,
              }}
            >
              Clear
            </Text>
          </Pressable>
        )}
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* MESSAGES */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {loadingHistory ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color={theme.colors.primary.DEFAULT} />
            </View>
          ) : messages.length === 0 && !isTyping ? (
            <SuggestedPrompts onSelect={sendMessage} />
          ) : (
            <>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
        </ScrollView>

        {/* INPUT */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 12 : 16,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0EE',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: theme.colors.surface.off,
              borderRadius: 24,
              paddingLeft: 16,
              paddingRight: 4,
              paddingVertical: 4,
              borderWidth: 1.5,
              borderColor: '#EFEFED',
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask DentBot anything..."
              placeholderTextColor="#B8B8B8"
              multiline
              style={{
                flex: 1,
                fontSize: 14,
                color: theme.colors.text.primary,
                paddingVertical: 10,
                maxHeight: 100,
              }}
              onSubmitEditing={() => sendMessage(input)}
            />

            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  input.trim() && !isTyping
                    ? theme.colors.primary.DEFAULT
                    : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
              }}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
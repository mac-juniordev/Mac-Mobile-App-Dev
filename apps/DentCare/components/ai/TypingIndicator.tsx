import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';

export default function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animation = withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );

    dot1.value = animation;
    dot2.value = withDelay(150, withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    ));
    dot3.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    ));
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View
      style={{
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 4,
      }}
    >
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
        <Animated.Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            color: theme.colors.primary.DEFAULT,
            letterSpacing: 0.5,
          }}
        >
          DENTBOT IS TYPING...
        </Animated.Text>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.primary.DEFAULT,
              opacity: 0.7,
            },
            style1,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.primary.DEFAULT,
              opacity: 0.7,
            },
            style2,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.primary.DEFAULT,
              opacity: 0.7,
            },
            style3,
          ]}
        />
      </View>
    </View>
  );
}
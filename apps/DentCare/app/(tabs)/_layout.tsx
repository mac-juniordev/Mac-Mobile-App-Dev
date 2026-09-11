import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BotIcon from '../../components/ui/icons/BotIcon';
import HomeIcon from '../../components/ui/icons/HomeIcon';
import TrackIcon from '../../components/ui/icons/TrackIcon';
import ProfileIcon from '../../components/ui/icons/ProfileIcon';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

/*
|--------------------------------------------------------------------------
| Tab configuration
|--------------------------------------------------------------------------
*/

const TABS = [
  { name: 'ai', label: 'DentBot', Icon: BotIcon },
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'track', label: 'Track', Icon: TrackIcon },
  { name: 'profile', label: 'Profile', Icon: ProfileIcon },
];

const TAB_BAR_HEIGHT = 70;
const PILL_WIDTH = (width - 32) / TABS.length;

/*
|--------------------------------------------------------------------------
| Animated Tab Item
|--------------------------------------------------------------------------
*/

interface TabItemProps {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  focused: boolean;
  onPress: () => void;
}

function TabItem({ Icon, label, focused, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0.6, { duration: 200 }),
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      }}
    >
      <Animated.View style={iconStyle}>
        <Icon
          size={24}
          color={focused ? theme.colors.primary.DEFAULT : '#8A8A8A'}
        />
      </Animated.View>
      <Animated.Text
        style={[
          {
            fontSize: 11,
            marginTop: 3,
            fontWeight: focused ? '600' : '500',
            color: focused ? theme.colors.primary.DEFAULT : '#8A8A8A',
          },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

/*
|--------------------------------------------------------------------------
| Custom Tab Bar
|--------------------------------------------------------------------------
*/

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pillLeft = useSharedValue(0);

  const activeIndex = state.index;

  useEffect(() => {
    // 16px is horizontal padding of the tab bar container
    const targetLeft = activeIndex * PILL_WIDTH + 16;
    pillLeft.value = withSpring(targetLeft, {
      damping: 18,
      stiffness: 180,
    });
  }, [activeIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillLeft.value }],
  }));

  return (
    <View
      style={{
        paddingBottom: insets.bottom || 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0EE',
      }}
    >
      <View
        style={{
          height: TAB_BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          position: 'relative',
        }}
      >
        {/* Sliding pill */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 8,
              left: 0,
              width: PILL_WIDTH - 8,
              height: 54,
              borderRadius: 27,
              backgroundColor: theme.colors.primary.subtle,
              marginHorizontal: 4,
            },
            pillStyle,
          ]}
        />

        {/* Tab items */}
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = TABS.find((t) => t.name === route.name) || TABS[0];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              Icon={tab.Icon}
              label={tab.label}
              focused={focused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Tabs Layout
|--------------------------------------------------------------------------
*/

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="ai" options={{ title: 'DentBot' }} />
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="track" options={{ title: 'Track' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
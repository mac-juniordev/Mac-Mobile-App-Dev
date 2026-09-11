import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Logo from '../components/ui/Logo';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  image?: any;
  title: string;
  subtitle: string;
  highlights?: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    image: require('../assets/images/onboarding-1.png'),
    title: 'Welcome to\nDentCare',
    subtitle: 'Your trusted companion for all your dental care needs.',
    highlights: undefined,
  },
  {
    id: '2',
    image: require('../assets/images/onboarding-2.png'),
    title: 'Find trusted\ndentists near you',
    subtitle: 'Discover verified dental professionals in your area.',
    highlights: [
      'Verified professionals',
      'Real patient reviews',
      'Easy appointment booking',
    ],
  },
  {
    id: '3',
    image: require('../assets/images/onboarding-3.png'),
    title: 'AI-powered\ndental assistant',
    subtitle: 'Get instant answers to your dental questions.',
    highlights: [
      'Personalized recommendations',
      'Treatment cost estimates',
      'Oral health tracking',
    ],
  },
  {
    id: '4',
    title: 'Ready to transform\nyour smile?',
    subtitle: 'Join thousands of patients who trust DentCare for their dental care journey.',
    highlights: undefined,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slideIndex);
  };

  const goToNextSlide = () => {
    if (activeSlide < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeSlide + 1) * width,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => {
          const isLastSlide = index === SLIDES.length - 1;
          
          return (
            <View key={slide.id} style={{ width, height: '100%' }}>
              {/* Conditional rendering: Image slides vs. CTA slide */}
              {!isLastSlide ? (
                <>
                  {/* Hero Image */}
                  <Image
                    source={slide.image}
                    style={{ width, height: height * 0.55 }}
                    contentFit="cover"
                    transition={300}
                  />
                  
                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    locations={[0.4, 0.7, 1]}
                    style={{
                      position: 'absolute',
                      top: height * 0.25,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Branded CTA Background */}
                  <LinearGradient
                    colors={['#E8F1FF', '#FFFFFF', '#FFF0E6']}
                    locations={[0, 0.5, 1]}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                  
                  {/* Decorative circles */}
                  <View 
                    className="absolute rounded-full bg-white/40"
                    style={{
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                    }}
                  />
                  <View 
                    className="absolute rounded-full bg-white/30"
                    style={{
                      bottom: height * 0.4,
                      left: -30,
                      width: 150,
                      height: 150,
                    }}
                  />
                  <View 
                    className="absolute rounded-full"
                    style={{
                      top: height * 0.25,
                      right: -20,
                      width: 100,
                      height: 100,
                      backgroundColor: 'rgba(58, 134, 255, 0.1)',
                    }}
                  />
                </>
              )}
              
              {/* Bottom Card - Same for all slides */}
              <View 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: isLastSlide ? height * 0.72 : height * 0.45,
                  backgroundColor: '#FFFFFF',
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                  paddingTop: 32,
                }}
              >
                <SafeAreaView className="flex-1" edges={['bottom']}>
                  <View className="flex-1 px-6 pb-6">
                    {/* Logo - Only on first and last slide */}
                    {(index === 0 || isLastSlide) && (
                      <View className="items-center mb-6">
                        <Logo size={isLastSlide ? 56 : 40} showText={false} />
                        {isLastSlide && (
                          <Text className="text-2xl font-bold tracking-widest mt-3 text-gray-900">
                            DENTCARE
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Title */}
                    <Text 
                      className={`font-bold text-center text-gray-900 mb-3 ${isLastSlide ? 'text-4xl' : 'text-3xl'}`}
                      style={{ lineHeight: isLastSlide ? 48 : 40 }}
                    >
                      {slide.title}
                    </Text>

                    {/* Subtitle */}
                    <Text 
                      className="text-base text-center text-gray-500 mb-6"
                      style={{ lineHeight: 24 }}
                    >
                      {slide.subtitle}
                    </Text>

                    {/* Highlights - Only if they exist */}
                    {slide.highlights && (
                      <View className="mb-6" style={{ gap: 12 }}>
                        {slide.highlights.map((highlight, idx) => (
                          <View key={idx} className="flex-row items-center">
                            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-3">
                              <Text className="text-blue-600 text-xs font-bold">✓</Text>
                            </View>
                            <Text className="text-sm text-gray-700 flex-1">{highlight}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Trust badges - Only on last slide */}
                    {isLastSlide && (
                      <View 
                        className="flex-row justify-center items-center mb-8"
                        style={{ gap: 20 }}
                      >
                        <View className="items-center flex-1">
                          <Text className="text-xl font-bold text-gray-900">10K+</Text>
                          <Text className="text-xs text-gray-500 mt-1">Patients</Text>
                        </View>
                        
                        <View className="w-px h-8 bg-gray-200" />
                        
                        <View className="items-center flex-1">
                          <Text className="text-xl font-bold text-gray-900">4.9★</Text>
                          <Text className="text-xs text-gray-500 mt-1">Rating</Text>
                        </View>
                        
                        <View className="w-px h-8 bg-gray-200" />
                        
                        <View className="items-center flex-1">
                          <Text className="text-xl font-bold text-gray-900">500+</Text>
                          <Text className="text-xs text-gray-500 mt-1">Dentists</Text>
                        </View>
                      </View>
                    )}

                    {/* Spacer */}
                    <View className="flex-1" />

                    {/* CTA Buttons - Only on last slide */}
                    {isLastSlide ? (
                      <View style={{ gap: 12 }}>
                        <TouchableOpacity
                          className="rounded-full py-4 items-center"
                          style={{ 
                            backgroundColor: theme.colors.primary.DEFAULT,
                            shadowColor: theme.colors.primary.DEFAULT,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6,
                          }}
                          onPress={handleGetStarted}
                        >
                          <Text className="text-white font-semibold text-base">
                            Get Started
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="bg-white border border-gray-200 rounded-full py-4 items-center"
                          onPress={handleLogin}
                        >
                          <Text className="text-gray-900 font-semibold text-base">
                            I already have an account
                          </Text>
                        </TouchableOpacity>

                        <Text className="text-center text-xs text-gray-400 mt-2">
                          By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="rounded-full py-4 items-center"
                        style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                        onPress={goToNextSlide}
                      >
                        <Text className="text-white font-semibold text-base">
                          Next
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Page Indicator */}
                    <View 
                      className="flex-row justify-center items-center mt-6"
                      style={{ gap: 8 }}
                    >
                      {SLIDES.map((_, idx) => (
                        <View
                          key={idx}
                          className="rounded-full"
                          style={{
                            width: idx === activeSlide ? 24 : 8,
                            height: 8,
                            backgroundColor: idx === activeSlide 
                              ? theme.colors.primary.DEFAULT 
                              : '#D1D5DB',
                          }}
                        />
                      ))}
                    </View>
                  </View>
                </SafeAreaView>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
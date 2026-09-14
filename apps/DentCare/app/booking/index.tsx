import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import ArrowLeftIcon from '../../components/ui/icons/ArrowLeftIcon';
import ArrowRightIcon from '../../components/ui/icons/ArrowRightIcon';
import CheckIcon from '../../components/ui/icons/CheckIcon';
import { theme } from '../../constants/theme';
import { dentistAPI } from '../../utils/axios';

const { width } = Dimensions.get('window');

/*
|--------------------------------------------------------------------------
| Types & Constants
|--------------------------------------------------------------------------
*/

interface Dentist {
  _id: string;
  fullName: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  photo: string;
  experience: number;
  priceRange: string;
  services: string[];
  clinic: {
    name: string;
    address: {
      city: string;
      state: string;
    };
  };
  languages: string[];
}

const SERVICES = [
  { id: 'Cleaning', label: 'Cleaning' },
  { id: 'Checkup', label: 'Checkup' },
  { id: 'Filling', label: 'Filling' },
  { id: 'Root Canal', label: 'Root Canal' },
  { id: 'Extraction', label: 'Extraction' },
  { id: 'Whitening', label: 'Whitening' },
  { id: 'Braces', label: 'Braces' },
  { id: 'Crown', label: 'Crown' },
  { id: 'Bridge', label: 'Bridge' },
  { id: 'Implant', label: 'Implant' },
  { id: 'Other', label: 'Other' },
];

const CARD_WIDTH = (width - 40 - 12) / 2;

/*
|--------------------------------------------------------------------------
| Booking Step 1
|--------------------------------------------------------------------------
*/

export default function BookingStepOne() {
  const router = useRouter();

  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dentistAPI.getAll();
        setDentists(response.data.dentists || []);
      } catch (error) {
        console.error('Failed to load dentists:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDentists = useMemo(() => {
    if (!selectedService) return dentists;
    return dentists.filter((d) => d.services.includes(selectedService));
  }, [dentists, selectedService]);

  useEffect(() => {
    if (selectedDentistId) {
      const stillValid = filteredDentists.some(
        (d) => d._id === selectedDentistId
      );
      if (!stillValid) setSelectedDentistId(null);
    }
  }, [filteredDentists, selectedDentistId]);

  const canContinue = selectedService !== null && selectedDentistId !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/booking/schedule',
      params: {
        service: selectedService!,
        dentistId: selectedDentistId!,
      },
    });
  };

  const selectedDentist = filteredDentists.find(
    (d) => d._id === selectedDentistId
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.off }}>
      {/* ============================================
          HEADER
      ============================================ */}

      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.95 : 1 }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            })}
          >
            <ArrowLeftIcon size={20} color={theme.colors.text.primary} />
          </Pressable>

          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: theme.colors.primary.subtle,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: theme.colors.primary.DEFAULT,
                letterSpacing: 0.5,
              }}
            >
              STEP 1 OF 2
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
            marginBottom: 6,
          }}
        >
          Book your visit
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text.secondary,
            lineHeight: 19,
          }}
        >
          Choose a service and pick the dentist you'd like to see.
        </Text>
      </Animated.View>

      {/* Progress bar */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 24,
          gap: 6,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.primary.DEFAULT,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#E5E5E3',
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ============================================
            SERVICE SELECTION
        ============================================ */}

        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: theme.colors.primary.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                1
              </Text>
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.text.primary,
                letterSpacing: -0.2,
              }}
            >
              What brings you in?
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SERVICES.map((service) => (
              <ServiceChip
                key={service.id}
                label={service.label}
                active={selectedService === service.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedService(service.id);
                }}
              />
            ))}
          </View>
        </View>

        {/* ============================================
            DENTIST SELECTION
        ============================================ */}

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: selectedService
                    ? theme.colors.primary.DEFAULT
                    : '#D1D5DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '800',
                  }}
                >
                  2
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  color: selectedService
                    ? theme.colors.text.primary
                    : theme.colors.text.tertiary,
                  letterSpacing: -0.2,
                }}
              >
                Choose your dentist
              </Text>
            </View>

            {selectedService && !loading && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: theme.colors.primary.subtle,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: theme.colors.primary.DEFAULT,
                  }}
                >
                  {filteredDentists.length}
                </Text>
              </View>
            )}
          </View>

          {!selectedService ? (
            <View
              style={{
                padding: 24,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#EFEFED',
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                Pick a service above to see dentists who offer it.
              </Text>
            </View>
          ) : loading ? (
            <View
              style={{
                paddingVertical: 40,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
              }}
            >
              <ActivityIndicator color={theme.colors.primary.DEFAULT} />
            </View>
          ) : filteredDentists.length === 0 ? (
            <View
              style={{
                padding: 24,
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#EFEFED',
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                No dentists offer this service yet. Try another.
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              {filteredDentists.map((dentist) => (
                <View key={dentist._id} style={{ width: CARD_WIDTH }}>
                  <DentistGridCard
                    dentist={dentist}
                    selected={selectedDentistId === dentist._id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDentistId(dentist._id);
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ============================================
          FIXED BOTTOM CTA
      ============================================ */}

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0EE',
        }}
      >
        {canContinue && selectedDentist && (
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: '500',
            }}
          >
            {selectedService} · {selectedDentist.fullName}
          </Text>
        )}

        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: canContinue
              ? theme.colors.primary.DEFAULT
              : '#E5E5E3',
            paddingVertical: 16,
            borderRadius: 999,
            shadowColor: canContinue ? theme.colors.primary.DEFAULT : '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: canContinue ? 0.35 : 0,
            shadowRadius: 12,
            elevation: canContinue ? 6 : 0,
          }}
        >
          <Text
            style={{
              color: canContinue ? '#FFFFFF' : '#8A8A8A',
              fontWeight: '700',
              fontSize: 15,
              letterSpacing: 0.3,
            }}
          >
            Continue to Step 2
          </Text>
          <View style={{ marginLeft: 8 }}>
            <ArrowRightIcon
              size={18}
              color={canContinue ? '#FFFFFF' : '#8A8A8A'}
              strokeWidth={2.5}
            />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Service Chip — plain object styles, no memoization
|--------------------------------------------------------------------------
*/

interface ServiceChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function ServiceChip({ label, active, onPress }: ServiceChipProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: active ? '#3A86FF' : '#FFFFFF',
        borderWidth: 1.5,
        borderColor: active ? '#3A86FF' : '#EFEFED',
        transform: [{ scale: pressed ? 0.96 : 1 }],
        shadowColor: active ? '#3A86FF' : '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: active ? 0.3 : 0.04,
        shadowRadius: 8,
        elevation: active ? 4 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: active ? '#FFFFFF' : '#1F1F1F',
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/*
|--------------------------------------------------------------------------
| Dentist Grid Card — plain object styles, no memoization
|--------------------------------------------------------------------------
*/

interface DentistGridCardProps {
  dentist: Dentist;
  selected: boolean;
  onPress: () => void;
}

function DentistGridCard({ dentist, selected, onPress }: DentistGridCardProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: selected ? '#3A86FF' : 'transparent',
        padding: 12,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: selected ? '#3A86FF' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: selected ? 0.2 : 0.06,
        shadowRadius: selected ? 10 : 6,
        elevation: selected ? 5 : 2,
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: selected ? '#3A86FF' : '#FFFFFF',
          borderWidth: 2,
          borderColor: selected ? '#3A86FF' : '#E5E5E3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />}
      </View>

      <Image
        source={{ uri: dentist.photo }}
        style={{
          width: '100%',
          height: CARD_WIDTH - 24,
          borderRadius: 14,
          backgroundColor: '#F5F5F3',
        }}
        contentFit="cover"
        transition={300}
      />

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginTop: 10,
          letterSpacing: -0.2,
        }}
        numberOfLines={1}
      >
        {dentist.fullName}
      </Text>

      <Text
        style={{
          fontSize: 11,
          color: theme.colors.text.secondary,
          marginTop: 2,
          fontWeight: '500',
        }}
        numberOfLines={1}
      >
        {dentist.specialty}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <Text style={{ fontSize: 11, color: '#F59E0B' }}>★</Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginLeft: 2,
          }}
        >
          {dentist.rating.toFixed(1)}
        </Text>
        <View
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: '#D1D5DB',
            marginHorizontal: 6,
          }}
        />
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.text.secondary,
            fontWeight: '500',
            flex: 1,
          }}
          numberOfLines={1}
        >
          {dentist.clinic.address.city}
        </Text>
      </View>
    </Pressable>
  );
}
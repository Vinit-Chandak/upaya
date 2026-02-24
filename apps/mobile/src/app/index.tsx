import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

/**
 * Splash Screen (Phase 1.1)
 * Auto-transitions after 1.5s:
 * - Returning user (language + onboarding done) → Home
 * - Language selected but no onboarding → Onboarding
 * - New user → Language selection
 */
export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const taglineEnFade = useRef(new Animated.Value(0)).current;
  const taglineEnSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.parallel([
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineEnFade, {
          toValue: 0.7,
          duration: 600,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineEnSlide, {
          toValue: 0,
          duration: 600,
          delay: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after 1.5s based on stored state
    const timer = setTimeout(async () => {
      try {
        const language = await AsyncStorage.getItem('upaya_language');
        const onboardingDone = await AsyncStorage.getItem('upaya_onboarding_completed');

        if (language && onboardingDone === 'true') {
          router.replace('/home');
        } else if (language) {
          router.replace('/onboarding');
        } else {
          router.replace('/language');
        }
      } catch {
        router.replace('/language');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, pulseAnim, taglineFade, taglineSlide, taglineEnFade, taglineEnSlide]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.symbol}>&#10048;</Text>
        <Text style={styles.logo}>UPAYA</Text>
        <Text style={styles.symbol}>&#10048;</Text>
      </Animated.View>

      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineFade, transform: [{ translateY: taglineSlide }] },
        ]}
      >
        आपका spiritual problem solver
      </Animated.Text>

      <Animated.Text
        style={[
          styles.taglineEn,
          { opacity: taglineEnFade, transform: [{ translateY: taglineEnSlide }] },
        ]}
      >
        Your spiritual problem solver
      </Animated.Text>

      {/* Decorative dots */}
      <View style={styles.particles}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 17}%` as unknown as number,
                opacity: 0.3 + i * 0.05,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.maroon,
    paddingHorizontal: wp(24),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  symbol: {
    fontSize: fp(28),
    color: colors.accent.gold,
  },
  logo: {
    fontSize: fp(42),
    fontWeight: '700',
    color: colors.neutral.white,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: fp(18),
    color: colors.neutral.cream,
    marginTop: hp(16),
    textAlign: 'center',
  },
  taglineEn: {
    fontSize: fp(14),
    color: colors.neutral.cream,
    marginTop: hp(4),
    textAlign: 'center',
  },
  particles: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  particle: {
    position: 'absolute',
    bottom: '10%',
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.accent.gold,
  },
});

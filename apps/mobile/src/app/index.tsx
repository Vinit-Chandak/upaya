import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import ShriYantra from '../components/icons/ShriYantra';
import CelestialBackground from '../components/CelestialBackground/CelestialBackground';

/**
 * Splash Screen (Phase 1.1)
 * Auto-transitions after 1.5s:
 * - Returning user (language + onboarding done) -> Home
 * - Language selected but no onboarding -> Onboarding
 * - New user -> Language selection
 */
export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, [router, fadeAnim, pulseAnim, taglineFade, taglineSlide]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <CelestialBackground variant="splash" />

      <Animated.View style={[styles.content, { transform: [{ scale: pulseAnim }] }]}>
        <ShriYantra size={28} color={colors.accent.gold} />
        <Text style={styles.logo}>UPAYA</Text>
        <ShriYantra size={28} color={colors.accent.gold} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineFade, transform: [{ translateY: taglineSlide }] },
        ]}
      >
        Your spiritual problem solver
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkTheme.pageBg,
    paddingHorizontal: wp(24),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    zIndex: 1,
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
    zIndex: 1,
  },
});

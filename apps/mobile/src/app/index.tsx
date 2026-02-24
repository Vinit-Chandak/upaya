import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

/**
 * Splash Screen — Auto-transitions to language selection after 1.5s.
 * If returning user, skip to Home/Chat.
 */
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: Check AsyncStorage for returning user
      // If returning user: router.replace('/home');
      router.replace('/language');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.logo}>UPAYA</Text>
        <Text style={styles.symbol}>✦</Text>
      </View>
      <Text style={styles.tagline}>आपका spiritual problem solver</Text>
      <Text style={styles.taglineEn}>Your spiritual problem solver</Text>
    </View>
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
    gap: wp(8),
  },
  symbol: {
    fontSize: fp(24),
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
    marginTop: hp(12),
    opacity: 0.95,
    textAlign: 'center',
  },
  taglineEn: {
    fontSize: fp(14),
    color: colors.neutral.cream,
    marginTop: hp(4),
    opacity: 0.7,
    textAlign: 'center',
  },
});

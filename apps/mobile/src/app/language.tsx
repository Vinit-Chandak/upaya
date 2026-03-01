import { useState, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import NamasteHands from '../components/icons/NamasteHands';
import LotusSymbol from '../components/icons/LotusSymbol';
import GlobeIcon from '../components/icons/GlobeIcon';
import HourglassClock from '../components/icons/HourglassClock';
import CelestialBackground from '../components/CelestialBackground/CelestialBackground';

interface LanguageOption {
  code: 'hi' | 'en';
  name: string;
  sub: string;
  icon: ReactNode;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'हिन्दी', sub: 'Hindi', icon: <LotusSymbol size={28} color="#FF8C00" /> },
  { code: 'en', name: 'English', sub: 'अंग्रेज़ी', icon: <GlobeIcon size={28} color="rgba(255,255,255,0.7)" /> },
];

const COMING_SOON = [
  { name: 'தமிழ்', sub: 'Coming Soon', icon: <HourglassClock size={28} color="rgba(255,255,255,0.5)" /> },
  { name: 'తెలుగు', sub: 'Coming Soon', icon: <HourglassClock size={28} color="rgba(255,255,255,0.5)" /> },
];

/**
 * Language Selection Screen (Phase 1.1)
 * Stores language preference in AsyncStorage and navigates to onboarding.
 */
export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const selectLanguage = async (lang: 'hi' | 'en') => {
    setSelected(lang);
    try {
      await AsyncStorage.setItem('upaya_language', lang);
    } catch {
      // Silently fail — language will default to Hindi
    }
    setTimeout(() => {
      router.replace('/onboarding');
    }, 200);
  };

  return (
    <View style={styles.container}>
      <CelestialBackground variant="subtle" />
      <View style={styles.namasteIcon}>
        <NamasteHands size={48} color="#FF8C00" />
      </View>
      <Text style={styles.title}>अपनी भाषा चुनें</Text>
      <Text style={styles.subtitle}>Choose your preferred language</Text>

      <View style={styles.options}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.card, selected === lang.code && styles.cardSelected]}
            activeOpacity={0.8}
            onPress={() => selectLanguage(lang.code)}
          >
            <View style={styles.flagIcon}>{lang.icon}</View>
            <View style={styles.cardInfo}>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langSub}>{lang.sub}</Text>
            </View>
            {selected === lang.code && (
              <Text style={styles.checkmark}>&#10003;</Text>
            )}
          </TouchableOpacity>
        ))}

        {COMING_SOON.map((lang) => (
          <View key={lang.name} style={[styles.card, styles.cardDisabled]}>
            <View style={styles.flagIcon}>{lang.icon}</View>
            <View style={styles.cardInfo}>
              <Text style={[styles.langName, styles.textDisabled]}>{lang.name}</Text>
              <Text style={[styles.langSub, styles.textDisabled]}>{lang.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        आप इसे कभी भी Settings में बदल सकते हैं
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkTheme.pageBg,
    paddingHorizontal: wp(24),
    paddingTop: hp(80),
    alignItems: 'center',
  },
  namasteIcon: {
    marginBottom: hp(8),
  },
  title: {
    fontSize: fp(24),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
    marginTop: hp(16),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(16),
    color: colors.darkTheme.textSecondary,
    marginTop: hp(4),
    textAlign: 'center',
  },
  options: {
    width: '100%',
    marginTop: hp(32),
    gap: hp(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(16),
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
    backgroundColor: colors.darkTheme.surface,
    borderRadius: wp(12),
    borderWidth: 2,
    borderColor: colors.darkTheme.border,
  },
  cardSelected: {
    borderColor: colors.primary.saffron,
    backgroundColor: colors.darkTheme.surfaceElevated,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  flagIcon: {
    width: wp(28),
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  langName: {
    fontSize: fp(18),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
  },
  langSub: {
    fontSize: fp(14),
    color: colors.darkTheme.textSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.darkTheme.textMuted,
  },
  checkmark: {
    fontSize: fp(20),
    color: colors.primary.saffron,
    fontWeight: '700',
  },
  hint: {
    fontSize: fp(12),
    color: colors.darkTheme.textMuted,
    marginTop: hp(24),
    textAlign: 'center',
  },
});

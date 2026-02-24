import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

interface LanguageOption {
  code: 'hi' | 'en';
  name: string;
  sub: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', sub: 'अंग्रेज़ी', flag: '🇬🇧' },
];

const COMING_SOON = [
  { name: 'தமிழ்', sub: 'Coming Soon', flag: '🔜' },
  { name: 'తెలుగు', sub: 'Coming Soon', flag: '🔜' },
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
      <Text style={styles.namaste}>🙏</Text>
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
            <Text style={styles.flag}>{lang.flag}</Text>
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
            <Text style={styles.flag}>{lang.flag}</Text>
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
    backgroundColor: colors.neutral.cream,
    paddingHorizontal: wp(24),
    paddingTop: hp(80),
    alignItems: 'center',
  },
  namaste: {
    fontSize: fp(48),
  },
  title: {
    fontSize: fp(24),
    fontWeight: '600',
    color: colors.neutral.grey900,
    marginTop: hp(16),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(16),
    color: colors.neutral.grey500,
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
    backgroundColor: colors.neutral.white,
    borderRadius: wp(12),
    borderWidth: 2,
    borderColor: colors.neutral.grey200,
  },
  cardSelected: {
    borderColor: colors.primary.saffron,
    backgroundColor: '#FFF8F0',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  flag: {
    fontSize: fp(28),
  },
  cardInfo: {
    flex: 1,
  },
  langName: {
    fontSize: fp(18),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  langSub: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.neutral.grey400,
  },
  checkmark: {
    fontSize: fp(20),
    color: colors.primary.saffron,
    fontWeight: '700',
  },
  hint: {
    fontSize: fp(12),
    color: colors.neutral.grey400,
    marginTop: hp(24),
    textAlign: 'center',
  },
});

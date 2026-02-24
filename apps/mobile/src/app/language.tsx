import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

/**
 * Language Selection Screen — Shown on first launch only.
 */
export default function LanguageScreen() {
  const router = useRouter();

  const selectLanguage = (_lang: 'hi' | 'en') => {
    // TODO: Store language in AsyncStorage
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.namaste}>🙏</Text>
      <Text style={styles.title}>अपनी भाषा चुनें</Text>
      <Text style={styles.subtitle}>Choose your preferred language</Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => selectLanguage('hi')}
        >
          <Text style={styles.flag}>🇮🇳</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.langName}>हिन्दी</Text>
            <Text style={styles.langSub}>Hindi</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => selectLanguage('en')}
        >
          <Text style={styles.flag}>🇬🇧</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.langName}>English</Text>
            <Text style={styles.langSub}>अंग्रेज़ी</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.card, styles.cardDisabled]}>
          <Text style={styles.flag}>🔜</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.langName, styles.textDisabled]}>தமிழ்</Text>
            <Text style={[styles.langSub, styles.textDisabled]}>Coming Soon</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardDisabled]}>
          <Text style={styles.flag}>🔜</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.langName, styles.textDisabled]}>తెలుగు</Text>
            <Text style={[styles.langSub, styles.textDisabled]}>Coming Soon</Text>
          </View>
        </View>
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
  hint: {
    fontSize: fp(12),
    color: colors.neutral.grey400,
    marginTop: hp(24),
    textAlign: 'center',
  },
});

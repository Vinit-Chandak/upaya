import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, PROBLEM_TYPES, getTranslations } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_KEYS = ['home', 'remedies', 'explore', 'me'] as const;
const TAB_ICONS: Record<string, string> = {
  home: '🏠', remedies: '📿', explore: '🛕', me: '👤',
};

function getTimeGreeting(language: 'hi' | 'en'): { emoji: string; text: string } {
  const t = getTranslations(language);
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { emoji: '🌅', text: t.greetings.morning };
  if (hour >= 12 && hour < 17) return { emoji: '☀️', text: t.greetings.afternoon };
  if (hour >= 17 && hour < 21) return { emoji: '🪔', text: t.greetings.evening };
  return { emoji: '🌙', text: t.greetings.night };
}

/**
 * Home / Chat Entry Screen (Phase 1.3)
 * First-time user view: illustration + prompt + problem chips + input bar
 * Returning user view: welcome + progress card + transit alert + recent chats + CTAs
 */
export default function HomeScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [hasHistory] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      try {
        const stored = await AsyncStorage.getItem('upaya_language');
        if (stored === 'hi' || stored === 'en') setLanguage(stored);
      } catch {
        // default hi
      }
    };
    loadLang();
  }, []);

  const toggleLanguage = async () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    try {
      await AsyncStorage.setItem('upaya_language', newLang);
    } catch {
      // Silently fail
    }
  };

  const handleChipPress = (chipKey: string) => {
    router.push({ pathname: '/chat', params: { problem: chipKey } });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    router.push({
      pathname: '/chat',
      params: { problem: 'something_else', message: inputValue.trim() },
    });
    setInputValue('');
  };

  const t = getTranslations(language);
  const timeGreeting = getTimeGreeting(language);
  const chipWidth = (SCREEN_WIDTH - wp(24) * 2 - wp(10)) / 2;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarSymbol}>&#10048;</Text>
          <Text style={styles.topBarLogo}>UPAYA</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarIcon} onPress={toggleLanguage}>
            <Text style={styles.topBarIconText}>🌐</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon}>
            <Text style={styles.topBarIconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasHistory ? (
          /* First-Time User View */
          <>
            {/* Time-based illustration */}
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>{timeGreeting.emoji}</Text>
              <Text style={styles.greetingText}>{timeGreeting.text}</Text>
            </View>

            {/* Main prompt */}
            <View style={styles.promptSection}>
              <Text style={styles.mainPrompt}>{t.home.mainPrompt}</Text>
              <Text style={styles.mainPromptSub}>{t.home.mainPromptSub}</Text>
            </View>

            {/* Problem chips */}
            <View style={styles.chipGrid}>
              {Object.entries(PROBLEM_TYPES).map(([key, info]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    { width: chipWidth },
                    key === 'get_kundli' && styles.chipGold,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleChipPress(key)}
                >
                  <Text style={styles.chipEmoji}>{info.emoji}</Text>
                  <Text style={styles.chipTextPrimary}>
                    {language === 'hi' ? info.hi : info.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          /* Returning User View */
          <>
            <Text style={styles.welcomeText}>{t.home.welcomeBack}</Text>

            {/* Active Remedy Plan */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📿</Text>
                <Text style={styles.cardTitle}>{t.home.returningUser.activeProtocol}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
            </View>

            {/* Transit Alert */}
            <View style={styles.alertCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚡</Text>
                <Text style={styles.cardTitle}>{t.home.returningUser.transitAlert}</Text>
              </View>
            </View>

            {/* Recent Chats */}
            <Text style={styles.sectionTitle}>{t.home.returningUser.recent}</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t.home.returningUser.noRecentChats}</Text>
            </View>

            {/* CTAs */}
            <View style={styles.ctaRow}>
              <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.8}>
                <Text style={styles.ctaSecondaryText}>{t.home.returningUser.continueChat}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaPrimary} activeOpacity={0.8}>
                <Text style={styles.ctaPrimaryText}>{t.home.returningUser.newProblem}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Input Bar (First-Time User Only) */}
      {!hasHistory && (
        <View style={styles.inputBarWrapper}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder={t.home.inputPlaceholder}
              placeholderTextColor={colors.neutral.grey400}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            {inputValue.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton}>
                <Text style={styles.micIcon}>🎙</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TAB_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabIcon, activeTab === key && styles.tabIconActive]}>
              {TAB_ICONS[key]}
            </Text>
            <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>
              {t.tabs[key as keyof typeof t.tabs]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(8),
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey100,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  topBarSymbol: {
    fontSize: fp(14),
    color: colors.accent.gold,
  },
  topBarLogo: {
    fontSize: fp(16),
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.secondary.maroon,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  topBarIcon: {
    padding: wp(6),
  },
  topBarIconText: {
    fontSize: fp(18),
  },

  /* Content */
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(16),
  },

  /* First-Time: Illustration */
  illustration: {
    alignItems: 'center',
    gap: hp(4),
    paddingTop: hp(24),
    paddingBottom: hp(8),
  },
  illustrationEmoji: {
    fontSize: fp(48),
  },
  greetingText: {
    fontSize: fp(16),
    color: colors.neutral.grey500,
    fontWeight: '500',
  },

  /* First-Time: Prompt */
  promptSection: {
    alignItems: 'center',
    marginBottom: hp(20),
  },
  mainPrompt: {
    fontSize: fp(22),
    fontWeight: '600',
    color: colors.neutral.grey800,
    textAlign: 'center',
    lineHeight: fp(22) * 1.35,
  },
  mainPromptSub: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    marginTop: hp(4),
    textAlign: 'center',
  },

  /* First-Time: Problem Chips */
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
    justifyContent: 'center',
  },
  chip: {
    alignItems: 'center',
    gap: hp(3),
    paddingVertical: hp(14),
    paddingHorizontal: wp(8),
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(12),
  },
  chipGold: {
    borderColor: colors.accent.gold,
    backgroundColor: '#FFF8F0',
  },
  chipEmoji: {
    fontSize: fp(24),
  },
  chipTextPrimary: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey800,
    textAlign: 'center',
  },
  chipTextSecondary: {
    fontSize: fp(11),
    color: colors.neutral.grey500,
    textAlign: 'center',
  },

  /* Input Bar */
  inputBarWrapper: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.grey100,
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(24),
    paddingHorizontal: wp(16),
    paddingVertical: hp(4),
  },
  input: {
    flex: 1,
    fontSize: fp(14),
    color: colors.neutral.grey800,
    paddingVertical: hp(8),
  },
  sendButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: colors.primary.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: fp(16),
    color: colors.neutral.white,
  },
  micButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: fp(18),
  },

  /* Bottom Tab Bar */
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.grey100,
    paddingTop: hp(6),
    paddingBottom: Platform.OS === 'ios' ? hp(24) : hp(10),
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: hp(2),
  },
  tabIcon: {
    fontSize: fp(20),
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: fp(10),
    fontWeight: '500',
    color: colors.neutral.grey400,
  },
  tabLabelActive: {
    color: colors.primary.saffron,
    fontWeight: '600',
  },

  /* Returning User: Welcome */
  welcomeText: {
    fontSize: fp(24),
    fontWeight: '600',
    color: colors.neutral.grey800,
    paddingTop: hp(20),
    marginBottom: hp(16),
  },

  /* Returning User: Cards */
  card: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(8),
  },
  cardIcon: {
    fontSize: fp(18),
  },
  cardTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  progressBar: {
    width: '100%',
    height: hp(6),
    backgroundColor: colors.neutral.grey100,
    borderRadius: hp(3),
    overflow: 'hidden',
    marginBottom: hp(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.saffron,
    borderRadius: hp(3),
  },
  cardMeta: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
  },

  alertCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(16),
  },
  alertText: {
    fontSize: fp(14),
    color: colors.neutral.grey700,
    marginTop: hp(4),
  },

  /* Returning User: Recent */
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.grey800,
    marginBottom: hp(12),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp(24),
  },
  emptyText: {
    fontSize: fp(14),
    color: colors.neutral.grey400,
  },

  /* Returning User: CTAs */
  ctaRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginTop: hp(8),
  },
  ctaSecondary: {
    flex: 1,
    paddingVertical: hp(14),
    borderRadius: wp(12),
    borderWidth: 2,
    borderColor: colors.primary.saffronLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.primary.saffron,
  },
  ctaPrimary: {
    flex: 1,
    paddingVertical: hp(14),
    borderRadius: wp(12),
    backgroundColor: colors.primary.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.white,
  },
});

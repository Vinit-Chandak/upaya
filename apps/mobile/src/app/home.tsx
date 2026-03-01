import { useState, useEffect, type ReactNode } from 'react';
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
import { Icon } from '../components/icons';
import ShriYantra from '../components/icons/ShriYantra';
import GlobeIcon from '../components/icons/GlobeIcon';
import BellIcon from '../components/icons/BellIcon';
import SunRise from '../components/icons/SunRise';
import SunFull from '../components/icons/SunFull';
import Diya from '../components/icons/Diya';
import MoonCrescent from '../components/icons/MoonCrescent';
import NamasteHands from '../components/icons/NamasteHands';
import MalaIcon from '../components/icons/MalaIcon';
import HomeTabIcon from '../components/icons/HomeTabIcon';
import TempleSilhouette from '../components/icons/TempleSilhouette';
import UserProfileIcon from '../components/icons/UserProfileIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import SendIcon from '../components/icons/SendIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_KEYS = ['home', 'remedies', 'explore', 'me'] as const;
const TAB_ICON_MAP: Record<string, (props: { color: string }) => ReactNode> = {
  home: ({ color }) => <HomeTabIcon size={20} color={color} />,
  remedies: ({ color }) => <MalaIcon size={20} color={color} />,
  explore: ({ color }) => <TempleSilhouette size={20} color={color} />,
  me: ({ color }) => <UserProfileIcon size={20} color={color} />,
};

function getTimeGreeting(language: 'hi' | 'en'): { icon: ReactNode; text: string } {
  const t = getTranslations(language);
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { icon: <SunRise size={48} color="#FF8C00" />, text: t.greetings.morning };
  if (hour >= 12 && hour < 17) return { icon: <SunFull size={48} color="#FF8C00" />, text: t.greetings.afternoon };
  if (hour >= 17 && hour < 21) return { icon: <Diya size={48} color="#D4A017" />, text: t.greetings.evening };
  return { icon: <MoonCrescent size={48} color="#D4A017" />, text: t.greetings.night };
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
          <ShriYantra size={14} color={colors.accent.gold} />
          <Text style={styles.topBarLogo}>UPAYA</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarIcon} onPress={toggleLanguage}>
            <GlobeIcon size={18} color={colors.darkTheme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon}>
            <BellIcon size={18} color={colors.darkTheme.textSecondary} />
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
              <View style={styles.illustrationIcon}>{timeGreeting.icon}</View>
              <Text style={styles.greetingText}>{timeGreeting.text}</Text>
            </View>

            {/* Main prompt */}
            <View style={styles.promptSection}>
              <Text style={styles.mainPrompt}>{t.home.mainPrompt}</Text>
              <Text style={styles.mainPromptSub}>{t.home.mainPromptSub}</Text>
            </View>

            {/* Problem tiles */}
            <View style={styles.chipGrid}>
              {Object.entries(PROBLEM_TYPES).map(([key, info]) => {
                const tileColor = colors.tiles[key as keyof typeof colors.tiles];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.tile,
                      { width: chipWidth, backgroundColor: tileColor?.bg || colors.darkTheme.surface },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleChipPress(key)}
                  >
                    {/* Background decoration art */}
                    <View style={styles.tileDecoration}>
                      <Icon name={info.iconName} size={90} color={tileColor?.text || '#D4A017'} />
                    </View>
                    {/* Bottom-left text */}
                    <View style={styles.tileTextArea}>
                      <Text style={[styles.tileTitle, { color: tileColor?.text || colors.darkTheme.textPrimary }]}>
                        {language === 'hi' ? info.hi : info.en}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          /* Returning User View */
          <>
            <View style={styles.welcomeRow}>
              <NamasteHands size={24} color="#FF8C00" />
              <Text style={styles.welcomeText}>{t.home.welcomeBack}</Text>
            </View>

            {/* Active Remedy Plan */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MalaIcon size={18} color="#FF8C00" />
                <Text style={styles.cardTitle}>{t.home.returningUser.activeProtocol}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
            </View>

            {/* Transit Alert */}
            <View style={styles.alertCard}>
              <View style={styles.cardHeader}>
                <SunFull size={18} color="#F59E0B" />
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
              placeholderTextColor={colors.darkTheme.textMuted}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            {inputValue.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <SendIcon size={16} color={colors.neutral.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton}>
                <MicrophoneIcon size={18} color={colors.darkTheme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TAB_KEYS.map((key) => {
          const isActive = activeTab === key;
          const iconColor = isActive ? colors.primary.saffron : colors.darkTheme.textMuted;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => setActiveTab(key)}
            >
              <View style={isActive ? undefined : styles.tabIconInactive}>
                {TAB_ICON_MAP[key]({ color: iconColor })}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {t.tabs[key as keyof typeof t.tabs]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkTheme.pageBg,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(8),
    backgroundColor: colors.darkTheme.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.darkTheme.border,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  topBarLogo: {
    fontSize: fp(16),
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.accent.gold,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  topBarIcon: {
    padding: wp(6),
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
  illustrationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: fp(16),
    color: colors.darkTheme.textSecondary,
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
    color: colors.darkTheme.textPrimary,
    textAlign: 'center',
    lineHeight: fp(22) * 1.35,
  },
  mainPromptSub: {
    fontSize: fp(14),
    color: colors.darkTheme.textSecondary,
    marginTop: hp(4),
    textAlign: 'center',
  },

  /* First-Time: Problem Tiles */
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
    justifyContent: 'center',
  },
  tile: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    height: hp(120),
    borderRadius: wp(14),
  },
  tileDecoration: {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    opacity: 0.25,
  },
  tileTextArea: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(12),
    paddingBottom: hp(12),
  },
  tileTitle: {
    fontSize: fp(15),
    fontWeight: '700',
  },

  /* Input Bar */
  inputBarWrapper: {
    backgroundColor: colors.darkTheme.pageBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.darkTheme.border,
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: colors.darkTheme.inputBg,
    borderWidth: 1.5,
    borderColor: colors.darkTheme.inputBorder,
    borderRadius: wp(24),
    paddingHorizontal: wp(16),
    paddingVertical: hp(4),
  },
  input: {
    flex: 1,
    fontSize: fp(14),
    color: colors.darkTheme.textPrimary,
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
  micButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Bottom Tab Bar */
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.darkTheme.pageBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.darkTheme.border,
    paddingTop: hp(6),
    paddingBottom: Platform.OS === 'ios' ? hp(24) : hp(10),
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: hp(2),
  },
  tabIconInactive: {
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: fp(10),
    fontWeight: '500',
    color: colors.darkTheme.textMuted,
  },
  tabLabelActive: {
    color: colors.primary.saffron,
    fontWeight: '600',
  },

  /* Returning User: Welcome */
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingTop: hp(20),
    marginBottom: hp(16),
  },
  welcomeText: {
    fontSize: fp(24),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
  },

  /* Returning User: Cards */
  card: {
    backgroundColor: colors.darkTheme.surface,
    borderWidth: 1,
    borderColor: colors.darkTheme.border,
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(8),
  },
  cardTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
  },
  progressBar: {
    width: '100%',
    height: hp(6),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: hp(3),
    overflow: 'hidden',
    marginBottom: hp(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.saffron,
    borderRadius: hp(3),
  },

  alertCard: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(16),
  },

  /* Returning User: Recent */
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
    marginBottom: hp(12),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp(24),
  },
  emptyText: {
    fontSize: fp(14),
    color: colors.darkTheme.textMuted,
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

import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, getTranslations } from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import NamasteHands from '../components/icons/NamasteHands';
import VenusGlyph from '../components/icons/VenusGlyph';
import MercuryGlyph from '../components/icons/MercuryGlyph';
import KundliChart from '../components/icons/KundliChart';
import ScrollRemedy from '../components/icons/ScrollRemedy';
import TempleSilhouette from '../components/icons/TempleSilhouette';
import PlayVideo from '../components/icons/PlayVideo';
import PrasadBox from '../components/icons/PrasadBox';
import ShieldLock from '../components/icons/ShieldLock';
import StarRating from '../components/icons/StarRating';
import ArrowRight from '../components/icons/ArrowRight';
import CelestialBackground from '../components/CelestialBackground/CelestialBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  { id: 'story' },
  { id: 'process' },
  { id: 'trust' },
];

interface Step {
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  icon: ReactNode;
}

const STEPS: Step[] = [
  { title: 'अपनी problem बताएं', titleEn: 'Tell your problem', desc: 'AI empathetically समझेगा', descEn: 'AI understands empathetically', icon: <MercuryGlyph size={22} color="#D4A017" /> },
  { title: 'AI आपकी कुंडली analyze करे', titleEn: 'AI analyzes your kundli', desc: 'Exact ग्रह और दोष ढूंढेगा', descEn: 'Finds exact planets and doshas', icon: <KundliChart size={22} color="#D4A017" /> },
  { title: 'Personalized remedy plan', titleEn: 'Personalized remedy plan', desc: 'Specific मंत्र, temples, timing', descEn: 'Specific mantras, temples, timing', icon: <ScrollRemedy size={22} color="#FF8C00" /> },
  { title: 'Temple पूजा + Video proof', titleEn: 'Temple puja + Video proof', desc: 'Real पूजा, video, प्रसाद', descEn: 'Real puja, video, prasad shipped', icon: <TempleSilhouette size={22} color="#FF8C00" /> },
];

/**
 * Onboarding Screen (Phase 1.2)
 * 3 swipeable screens: Emotional Hook -> How It Works -> Trust & CTA
 * Stores onboarding_completed in AsyncStorage on completion.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  // Staggered step animation
  const stepAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;

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

  useEffect(() => {
    if (currentPage === 1) {
      // Reset and stagger step animations
      stepAnims.forEach((anim) => anim.setValue(0));
      stepAnims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 200 * (i + 1),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentPage, stepAnims]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const goToNext = () => {
    if (currentPage < ONBOARDING_SCREENS.length - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentPage + 1), animated: true });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('upaya_onboarding_completed', 'true');
    } catch {
      // Silently fail
    }
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip &rarr;</Text>
      </TouchableOpacity>

      {/* Swipeable Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Screen 1: Emotional Hook */}
        <View style={styles.page}>
          <View style={styles.illustrationCircle}>
            <NamasteHands size={48} color="#FF8C00" />
          </View>
          <Text style={styles.pageTitle}>
            {language === 'hi'
              ? 'हमने आप जैसे लोगों की मदद की है'
              : "We've Helped People Like You"}
          </Text>
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialNameRow}>
              <VenusGlyph size={16} color="#D4A017" />
              <Text style={styles.testimonialName}>
                {language === 'hi' ? 'प्रिया, 28, लखनऊ' : 'Priya, 28, Lucknow'}
              </Text>
            </View>
            <Text style={styles.testimonialText}>
              {language === 'hi'
                ? '4 साल से शादी के रिश्ते आ के टूट रहे थे। सबने कहा मंगल दोष है, लेकिन कोई solution नहीं बताया।\n\nUpaya ने कुंडली analyze की → exact problem मिली → मंगलनाथ Temple में specific पूजा suggest की।\n\n5 महीने में रिश्ता पक्का हुआ।'
                : "Marriage talks kept falling apart for 4 years. Everyone said it's Mangal Dosha but nobody gave a real solution.\n\nUpaya analyzed my chart, found the exact cause, and recommended a specific puja at Mangalnath Temple.\n\nGot married within 5 months."}
            </Text>
          </View>
        </View>

        {/* Screen 2: How It Works */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>
            {language === 'hi' ? 'Upaya कैसे काम करता है' : 'How Upaya Works'}
          </Text>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <View key={i}>
                <Animated.View
                  style={[
                    styles.stepRow,
                    {
                      opacity: stepAnims[i],
                      transform: [
                        {
                          translateY: stepAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.stepIconCircle}>
                    {step.icon}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>
                      {language === 'hi' ? step.title : step.titleEn}
                    </Text>
                    <Text style={styles.stepDesc}>
                      {language === 'hi' ? step.desc : step.descEn}
                    </Text>
                  </View>
                </Animated.View>
                {i < 3 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
          <Text style={styles.stepTagline}>
            {language === 'hi'
              ? 'Diagnosis से लेकर remedy execution तक — सब एक जगह'
              : 'From diagnosis to remedy execution — all in one place'}
          </Text>
        </View>

        {/* Screen 3: Trust & CTA */}
        <View style={styles.page}>
          <CelestialBackground variant="subtle" />
          <Text style={styles.pageTitle}>
            {getTranslations(language).onboarding.screen3.title}
          </Text>
          <View style={styles.badgeGrid}>
            {([
              { icon: <KundliChart size={22} color="#D4A017" />, label: '50,000+', sublabel: language === 'hi' ? 'कुंडलियाँ analyzed' : 'Kundlis analyzed' },
              { icon: <TempleSilhouette size={22} color="#FF8C00" />, label: '100+', sublabel: language === 'hi' ? 'Temples verified' : 'Temples verified' },
              { icon: <PlayVideo size={22} color="#FF8C00" />, label: language === 'hi' ? 'Video proof' : 'Video proof', sublabel: language === 'hi' ? 'हर पूजा का' : 'of every puja' },
              { icon: <PrasadBox size={22} color="#FF8C00" />, label: language === 'hi' ? 'प्रसाद' : 'Prasad', sublabel: language === 'hi' ? 'delivered at home' : 'delivered home' },
              { icon: <ShieldLock size={22} color="#10B981" />, label: '100%', sublabel: 'Private & Secure' },
              { icon: <NamasteHands size={22} color="#FF8C00" />, label: 'Pandit', sublabel: 'verified' },
            ] as const).map((badge) => (
              <View key={badge.sublabel} style={styles.badge}>
                <View style={styles.badgeIconWrap}>{badge.icon}</View>
                <Text style={styles.badgeLabel}>{badge.label}</Text>
                <Text style={styles.badgeSublabel}>{badge.sublabel}</Text>
              </View>
            ))}
          </View>
          <View style={styles.miniTestimonial}>
            <View style={styles.starsRow}>
              <StarRating size={14} color="#D4A017" filled />
              <StarRating size={14} color="#D4A017" filled />
              <StarRating size={14} color="#D4A017" filled />
              <StarRating size={14} color="#D4A017" filled />
              <StarRating size={14} color="#D4A017" filled />
            </View>
            <Text style={styles.miniText}>
              {language === 'hi'
                ? '"पहली बार लगा कि किसी ने सच में समझा और सही रास्ता बताया"'
                : '"For the first time, I felt truly understood and guided on the right path"'}
            </Text>
            <Text style={styles.miniAuthor}>
              — {language === 'hi' ? 'राहुल S., दिल्ली' : 'Rahul S., Delhi'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom: Dots + Button */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {ONBOARDING_SCREENS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, currentPage === i && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, currentPage === 2 && styles.buttonPrimary]}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          {currentPage < 2 ? (
            <Text style={[styles.buttonText, currentPage === 2 && styles.buttonTextPrimary]}>
              {language === 'hi' ? 'आगे बढ़ें' : 'Next'}
            </Text>
          ) : (
            <View style={styles.ctaButtonRow}>
              <ArrowRight size={18} color="#FFFFFF" />
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {language === 'hi' ? ' शुरू करें' : ' Get Started'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {currentPage === 2 && (
          <Text style={styles.ctaSub}>
            {language === 'hi'
              ? 'Free कुंडली analysis · No login required'
              : 'Free kundli analysis · No login required'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkTheme.pageBg,
  },
  skipButton: {
    position: 'absolute',
    top: hp(50),
    right: wp(20),
    zIndex: 10,
    padding: wp(8),
  },
  skipText: {
    fontSize: fp(14),
    color: colors.darkTheme.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: wp(24),
    paddingTop: hp(80),
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: fp(22),
    fontWeight: '600',
    textAlign: 'center',
    color: colors.darkTheme.textPrimary,
    marginBottom: hp(20),
  },
  illustrationCircle: {
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    backgroundColor: colors.darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
  },
  testimonialCard: {
    backgroundColor: colors.darkTheme.surface,
    borderRadius: wp(12),
    padding: wp(20),
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
    width: '100%',
  },
  testimonialNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(8),
  },
  testimonialName: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
  },
  testimonialText: {
    fontSize: fp(15),
    color: colors.darkTheme.textSecondary,
    lineHeight: fp(15) * 1.6,
  },
  stepsContainer: {
    width: '100%',
    paddingHorizontal: wp(8),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  stepIconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: colors.darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
  },
  stepDesc: {
    fontSize: fp(13),
    color: colors.darkTheme.textSecondary,
    marginTop: 2,
  },
  stepConnector: {
    width: 2,
    height: hp(18),
    backgroundColor: colors.darkTheme.border,
    marginLeft: wp(21),
    marginVertical: hp(4),
  },
  stepTagline: {
    fontSize: fp(14),
    color: colors.darkTheme.textSecondary,
    textAlign: 'center',
    marginTop: hp(20),
    fontStyle: 'italic',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(10),
    marginBottom: hp(16),
  },
  badge: {
    width: (SCREEN_WIDTH - wp(24) * 2 - wp(10) * 2) / 3,
    alignItems: 'center',
    padding: wp(10),
    backgroundColor: colors.darkTheme.surface,
    borderRadius: wp(10),
  },
  badgeIconWrap: {
    marginBottom: hp(2),
  },
  badgeLabel: {
    fontSize: fp(12),
    fontWeight: '600',
    color: colors.darkTheme.textPrimary,
    textAlign: 'center',
  },
  badgeSublabel: {
    fontSize: fp(10),
    color: colors.darkTheme.textSecondary,
    textAlign: 'center',
    lineHeight: fp(10) * 1.4,
    marginTop: 1,
  },
  miniTestimonial: {
    backgroundColor: colors.darkTheme.surface,
    borderRadius: wp(12),
    padding: wp(16),
    width: '100%',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: hp(8),
  },
  miniText: {
    fontSize: fp(14),
    color: colors.darkTheme.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  miniAuthor: {
    fontSize: fp(12),
    color: colors.darkTheme.textMuted,
    marginTop: hp(8),
  },
  bottom: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(32),
    alignItems: 'center',
    gap: hp(12),
  },
  dots: {
    flexDirection: 'row',
    gap: wp(8),
  },
  dot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1.5,
    borderColor: colors.darkTheme.border,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.primary.saffron,
    borderColor: colors.primary.saffron,
  },
  button: {
    width: '100%',
    paddingVertical: hp(14),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.saffronLight,
  },
  buttonPrimary: {
    backgroundColor: colors.primary.saffron,
    borderColor: colors.primary.saffron,
  },
  buttonText: {
    fontSize: fp(17),
    fontWeight: '600',
    color: colors.primary.saffron,
  },
  buttonTextPrimary: {
    color: colors.neutral.white,
  },
  ctaButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  ctaSub: {
    fontSize: fp(12),
    color: colors.darkTheme.textMuted,
  },
});

import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  {
    id: 'story',
    title: 'हमने आप जैसे लोगों की मदद की है',
    titleEn: "We've Helped People Like You",
  },
  {
    id: 'process',
    title: 'Upaya कैसे काम करता है',
    titleEn: 'How Upaya Works',
  },
  {
    id: 'trust',
    title: 'आपका spiritual problem solver',
    titleEn: 'Your spiritual problem solver',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const completeOnboarding = () => {
    // TODO: Store onboarding_completed in AsyncStorage
    router.replace('/language'); // Will be replaced with '/home' once built
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip →</Text>
      </TouchableOpacity>

      {/* Swipeable Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Screen 1: Emotional Hook */}
        <View style={styles.page}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>🙏</Text>
          </View>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialName}>💍 प्रिया, 28, लखनऊ</Text>
            <Text style={styles.testimonialText}>
              4 साल से शादी के रिश्ते आ के टूट रहे थे। सबने कहा मंगल दोष है, लेकिन कोई
              solution नहीं बताया।{'\n\n'}Upaya ने कुंडली analyze की → exact problem मिली →
              मंगलनाथ Temple में specific पूजा suggest की।{'\n\n'}5 महीने में रिश्ता पक्का
              हुआ। 🙏
            </Text>
          </View>
        </View>

        {/* Screen 2: How It Works */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>Upaya कैसे काम करता है</Text>
          <View style={styles.stepsContainer}>
            {[
              { num: '①', title: 'अपनी problem बताएं', desc: 'AI empathetically समझेगा', icon: '💬' },
              { num: '②', title: 'AI आपकी कुंडली analyze करे', desc: 'Exact ग्रह और दोष ढूंढेगा', icon: '📊' },
              { num: '③', title: 'Personalized remedy plan', desc: 'Specific मंत्र, temples, timing', icon: '📜' },
              { num: '④', title: 'Temple पूजा + Video proof', desc: 'Real पूजा, video, प्रसाद', icon: '🛕' },
            ].map((step, i) => (
              <View key={i}>
                <View style={styles.stepRow}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
                {i < 3 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
          <Text style={styles.stepTagline}>
            Diagnosis से लेकर remedy execution तक — सब एक जगह
          </Text>
        </View>

        {/* Screen 3: Trust & CTA */}
        <View style={styles.page}>
          <Text style={styles.pageTitle}>✨ आपका spiritual problem solver ✨</Text>
          <View style={styles.badgeGrid}>
            {[
              { icon: '📊', label: 'Kundlis\nanalyzed' },
              { icon: '🛕', label: 'Temples\nverified' },
              { icon: '📹', label: 'Video proof\nof every puja' },
              { icon: '📦', label: 'Prasad\ndelivered' },
              { icon: '🔒', label: '100%\nPrivate' },
              { icon: '🙏', label: 'Pandit\nverified' },
            ].map((badge) => (
              <View key={badge.label} style={styles.badge}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.miniTestimonial}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.miniText}>
              &quot;पहली बार लगा कि किसी ने सच में समझा और सही रास्ता बताया&quot;
            </Text>
            <Text style={styles.miniAuthor}>— राहुल S., दिल्ली</Text>
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
        <TouchableOpacity style={styles.button} onPress={goToNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentPage < 2 ? 'आगे बढ़ें →' : '🙏 शुरू करें'}
          </Text>
        </TouchableOpacity>
        {currentPage === 2 && (
          <Text style={styles.ctaSub}>Free कुंडली analysis · No login required</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
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
    color: colors.neutral.grey500,
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
    color: colors.neutral.grey800,
    marginBottom: hp(24),
  },
  illustrationPlaceholder: {
    width: wp(200),
    height: hp(150),
    borderRadius: wp(16),
    backgroundColor: colors.neutral.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
  illustrationEmoji: {
    fontSize: fp(64),
  },
  testimonialCard: {
    backgroundColor: colors.neutral.cream,
    borderRadius: wp(12),
    padding: wp(20),
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
    width: '100%',
  },
  testimonialName: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.grey800,
    marginBottom: hp(8),
  },
  testimonialText: {
    fontSize: fp(15),
    color: colors.neutral.grey700,
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
  stepIcon: {
    fontSize: fp(28),
    width: wp(40),
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  stepDesc: {
    fontSize: fp(13),
    color: colors.neutral.grey500,
    marginTop: 2,
  },
  stepConnector: {
    width: 2,
    height: hp(20),
    backgroundColor: colors.neutral.grey200,
    marginLeft: wp(19),
    marginVertical: hp(4),
  },
  stepTagline: {
    fontSize: fp(14),
    color: colors.neutral.grey600,
    textAlign: 'center',
    marginTop: hp(20),
    fontStyle: 'italic',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(12),
    marginBottom: hp(20),
  },
  badge: {
    width: (SCREEN_WIDTH - wp(24) * 2 - wp(12) * 2) / 3,
    alignItems: 'center',
    padding: wp(12),
    backgroundColor: colors.neutral.grey50,
    borderRadius: wp(8),
  },
  badgeIcon: {
    fontSize: fp(24),
    marginBottom: hp(4),
  },
  badgeLabel: {
    fontSize: fp(11),
    color: colors.neutral.grey600,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: fp(11) * 1.4,
  },
  miniTestimonial: {
    backgroundColor: colors.neutral.cream,
    borderRadius: wp(12),
    padding: wp(16),
    width: '100%',
    alignItems: 'center',
  },
  stars: {
    fontSize: fp(14),
    marginBottom: hp(8),
  },
  miniText: {
    fontSize: fp(14),
    color: colors.neutral.grey700,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  miniAuthor: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
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
    borderColor: colors.neutral.grey300,
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
  },
  buttonText: {
    fontSize: fp(17),
    fontWeight: '600',
    color: colors.primary.saffron,
  },
  ctaSub: {
    fontSize: fp(12),
    color: colors.neutral.grey400,
  },
});

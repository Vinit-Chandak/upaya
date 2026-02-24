import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---- Types ----

type AnimationPhase = 1 | 2 | 3 | 4;

interface PlanetData {
  symbol: string;
  name: string;
  house: number;
  revealed: boolean;
}

interface DoshaCheckItem {
  key: string;
  label: string;
  status: 'pending' | 'checking' | 'done';
}

// ---- Planet definitions ----

const PLANETS: PlanetData[] = [
  { symbol: '☀️', name: 'Sun', house: 1, revealed: false },
  { symbol: '🌙', name: 'Moon', house: 4, revealed: false },
  { symbol: '♂️', name: 'Mars', house: 7, revealed: false },
  { symbol: '☿', name: 'Mercury', house: 3, revealed: false },
  { symbol: '♃', name: 'Jupiter', house: 2, revealed: false },
  { symbol: '♀', name: 'Venus', house: 6, revealed: false },
  { symbol: '♄', name: 'Saturn', house: 7, revealed: false },
  { symbol: '☊', name: 'Rahu', house: 12, revealed: false },
  { symbol: '☋', name: 'Ketu', house: 6, revealed: false },
];

// ---- Helpers ----

function getPositionOnCircle(index: number, total: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const wheelSize = wp(220);
  return {
    left: wheelSize / 2 + radius * Math.cos(angle) - wp(16),
    top: wheelSize / 2 + radius * Math.sin(angle) - wp(16),
  };
}

function generateStars(count: number) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    });
  }
  return stars;
}

// ---- Component ----

export default function KundliAnimationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dob?: string;
    tob?: string;
    place?: string;
    lang?: string;
  }>();

  const dob = params.dob || '';
  const tob = params.tob || '';
  const place = params.place || '';
  const lang = (params.lang || 'hi') as 'hi' | 'en';

  const [phase, setPhase] = useState<AnimationPhase>(1);
  const [progress, setProgress] = useState(0);
  const [planets, setPlanets] = useState<PlanetData[]>(
    PLANETS.map((p) => ({ ...p }))
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [doshaChecks, setDoshaChecks] = useState<DoshaCheckItem[]>([]);
  const [discoveryMessages, setDiscoveryMessages] = useState<string[]>([]);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(
    Array.from({ length: 40 }, () => new Animated.Value(Math.random()))
  ).current;

  const stars = useMemo(() => generateStars(40), []);

  // Dosha check labels per language
  const doshaCheckLabels = useMemo(
    () =>
      lang === 'hi'
        ? [
            { key: 'mangal', label: 'मंगल दोष check कर रहे हैं...' },
            { key: 'shani', label: 'शनि दोष check कर रहे हैं...' },
            { key: 'rahuKetu', label: 'राहु-केतु दोष check कर रहे हैं...' },
            { key: 'kaalSarp', label: 'काल सर्प योग check कर रहे हैं...' },
            { key: 'pitra', label: 'पितृ दोष check कर रहे हैं...' },
            { key: 'dasha', label: 'दशा periods analyze कर रहे हैं...' },
            { key: 'severity', label: 'Severity compute कर रहे हैं...' },
          ]
        : [
            { key: 'mangal', label: 'Checking Mangal Dosha...' },
            { key: 'shani', label: 'Checking Shani Dosha...' },
            { key: 'rahuKetu', label: 'Checking Rahu-Ketu Dosha...' },
            { key: 'kaalSarp', label: 'Checking Kaal Sarp Yog...' },
            { key: 'pitra', label: 'Checking Pitra Dosha...' },
            { key: 'dasha', label: 'Analyzing Dasha periods...' },
            { key: 'severity', label: 'Computing severity...' },
          ],
    [lang]
  );

  // Continuous wheel rotation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [wheelRotation]);

  // Star twinkling
  useEffect(() => {
    const loops = starAnims.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 1000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [starAnims]);

  // Phase 1: Computing planetary positions (0-25%)
  useEffect(() => {
    if (phase !== 1) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 25) {
          clearInterval(interval);
          setTimeout(() => setPhase(2), 300);
          return 25;
        }
        return p + 1;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Scanning planets (25-60%)
  useEffect(() => {
    if (phase !== 2) return;

    let currentPlanet = 0;
    const planetInterval = setInterval(() => {
      if (currentPlanet >= PLANETS.length) {
        clearInterval(planetInterval);
        setTimeout(() => setPhase(3), 500);
        return;
      }

      const idx = currentPlanet;
      setPlanets((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, revealed: true } : p))
      );
      setRevealedCount((c) => c + 1);

      const planet = PLANETS[idx];
      const msg = `${planet.symbol} ${planet.name} → ${planet.house}th house`;
      setDiscoveryMessages((prev) => [...prev.slice(-3), msg]);

      setProgress(25 + Math.round(((idx + 1) / PLANETS.length) * 35));
      currentPlanet++;
    }, 400);

    return () => clearInterval(planetInterval);
  }, [phase]);

  // Phase 3: Analyzing doshas (60-90%)
  useEffect(() => {
    if (phase !== 3) return;

    setDoshaChecks(
      doshaCheckLabels.map((d) => ({ ...d, status: 'pending' as const }))
    );

    let currentCheck = 0;
    const checkInterval = setInterval(() => {
      if (currentCheck >= doshaCheckLabels.length) {
        clearInterval(checkInterval);
        setTimeout(() => setPhase(4), 500);
        return;
      }

      const idx = currentCheck;

      setDoshaChecks((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, status: 'checking' } : d))
      );

      if (idx > 0) {
        setDoshaChecks((prev) =>
          prev.map((d, i) => (i === idx - 1 ? { ...d, status: 'done' } : d))
        );
      }

      setProgress(
        60 + Math.round(((idx + 1) / doshaCheckLabels.length) * 30)
      );
      currentCheck++;
    }, 500);

    return () => clearInterval(checkInterval);
  }, [phase, doshaCheckLabels]);

  // Phase 4: Complete (100%)
  useEffect(() => {
    if (phase !== 4) return;
    setProgress(100);
    setDoshaChecks((prev) => prev.map((d) => ({ ...d, status: 'done' })));
  }, [phase]);

  const handleViewDiagnosis = useCallback(() => {
    router.push('/home');
  }, [router]);

  // Phase titles
  const phaseTitle = (() => {
    switch (phase) {
      case 1:
        return lang === 'hi'
          ? 'आपकी कुंडली बन रही है...'
          : 'Generating your Kundli...';
      case 2:
        return lang === 'hi'
          ? 'ग्रह Scan हो रहे हैं...'
          : 'Scanning Planets...';
      case 3:
        return lang === 'hi'
          ? 'दोष Analysis हो रहा है...'
          : 'Analyzing Doshas...';
      case 4:
        return 'Analysis Complete';
    }
  })();

  const phaseSub = (() => {
    switch (phase) {
      case 1:
        return `Computing planetary positions for ${dob}, ${tob || 'approximate'}, ${place}...`;
      case 2:
        return lang === 'hi'
          ? `${revealedCount}/${PLANETS.length} ग्रह scan हुए`
          : `${revealedCount}/${PLANETS.length} planets scanned`;
      case 3:
        return lang === 'hi'
          ? 'सभी दोषों की जाँच हो रही है...'
          : 'Checking all doshas...';
      case 4:
        return '';
    }
  })();

  const wheelSpin = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const wheelRadius = wp(90);

  return (
    <View style={s.container}>
      {/* Starfield */}
      <View style={StyleSheet.absoluteFill}>
        {stars.map((star, i) => (
          <Animated.View
            key={i}
            style={[
              s.star,
              {
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: star.size,
                height: star.size,
                opacity: starAnims[i],
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Birth Summary Chips */}
        <View style={s.birthSummary}>
          <View style={s.birthChip}>
            <Text style={s.birthChipIcon}>📅</Text>
            <Text style={s.birthChipText}>{dob}</Text>
          </View>
          {tob ? (
            <View style={s.birthChip}>
              <Text style={s.birthChipIcon}>🕐</Text>
              <Text style={s.birthChipText}>{tob}</Text>
            </View>
          ) : null}
          <View style={s.birthChip}>
            <Text style={s.birthChipIcon}>📍</Text>
            <Text style={s.birthChipText}>{place}</Text>
          </View>
        </View>

        {/* Kundli Wheel */}
        <View style={s.wheelWrapper}>
          <Animated.View
            style={[
              s.wheelContainer,
              { transform: [{ rotate: wheelSpin }] },
            ]}
          >
            {/* Outer ring */}
            <View style={s.wheelOuter} />
            {/* Middle ring */}
            <View style={s.wheelMiddle} />
            {/* Inner ring */}
            <View style={s.wheelInner} />
          </Animated.View>

          {/* Center symbol (does not rotate) */}
          <View style={s.wheelCenter}>
            <Text style={s.wheelCenterSymbol}>
              {phase === 4 ? '✨' : '🙏'}
            </Text>
          </View>

          {/* Planet nodes positioned around the wheel */}
          {planets.map((planet, i) => {
            const pos = getPositionOnCircle(i, planets.length, wheelRadius);
            return (
              <View
                key={`${planet.name}-${i}`}
                style={[
                  s.planetNode,
                  planet.revealed
                    ? s.planetNodeRevealed
                    : s.planetNodeHidden,
                  { left: pos.left, top: pos.top },
                ]}
              >
                <Text style={s.planetNodeText}>
                  {planet.revealed ? planet.symbol : '?'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Phase title and subtitle */}
        <Text style={s.phaseTitle}>{phaseTitle}</Text>
        {phaseSub ? <Text style={s.phaseSub}>{phaseSub}</Text> : null}

        {/* Phase 2: Planet discovery messages */}
        {phase === 2 && discoveryMessages.length > 0 && (
          <View style={s.discoveryBox}>
            {discoveryMessages.map((msg, i) => (
              <View key={i} style={s.discoveryLine}>
                <Text style={s.discoveryArrow}>▸</Text>
                <Text style={s.discoveryText}>{msg}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Phase 3 & 4: Dosha checklist */}
        {(phase === 3 || phase === 4) && doshaChecks.length > 0 && (
          <View style={s.doshaChecklist}>
            {doshaChecks.map((check) => (
              <View
                key={check.key}
                style={[
                  s.doshaCheckItem,
                  check.status === 'checking' && s.doshaCheckItemActive,
                  check.status === 'done' && s.doshaCheckItemDone,
                ]}
              >
                <View
                  style={[
                    s.doshaCheckIcon,
                    check.status === 'checking' && s.doshaCheckIconActive,
                    check.status === 'done' && s.doshaCheckIconDone,
                  ]}
                >
                  <Text style={s.doshaCheckIconText}>
                    {check.status === 'done'
                      ? '✓'
                      : check.status === 'checking'
                        ? '◌'
                        : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    s.doshaCheckLabel,
                    check.status === 'done' && s.doshaCheckLabelDone,
                  ]}
                >
                  {check.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Phase 4: Complete */}
        {phase === 4 && (
          <View style={s.completeSection}>
            <Text style={s.completeIcon}>✨</Text>
            <Text style={s.completeTitle}>Analysis Complete</Text>
            <Text style={s.completeSub}>
              {lang === 'hi'
                ? 'आपकी कुंडली analysis तैयार है'
                : 'Your kundli analysis is ready'}
            </Text>
            <TouchableOpacity
              style={s.viewDiagnosisButton}
              onPress={handleViewDiagnosis}
              activeOpacity={0.8}
            >
              <Text style={s.viewDiagnosisText}>
                {lang === 'hi' ? 'अपनी Diagnosis देखें' : 'View Your Diagnosis'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress bar */}
        <View style={s.progressContainer}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={s.progressLabel}>{progress}%</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const WHEEL_SIZE = wp(220);

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A2E',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(60) : hp(40),
    paddingBottom: hp(40),
    paddingHorizontal: wp(20),
  },

  /* Stars */
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  /* Birth Summary */
  birthSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(8),
    marginBottom: hp(20),
  },
  birthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(20),
  },
  birthChipIcon: {
    fontSize: fp(12),
  },
  birthChipText: {
    fontSize: fp(12),
    color: 'rgba(255,255,255,0.9)',
  },

  /* Kundli Wheel */
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(24),
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelOuter: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.3)',
  },
  wheelMiddle: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.7,
    height: WHEEL_SIZE * 0.7,
    borderRadius: (WHEEL_SIZE * 0.7) / 2,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  wheelInner: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.4,
    height: WHEEL_SIZE * 0.4,
    borderRadius: (WHEEL_SIZE * 0.4) / 2,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.15)',
  },
  wheelCenter: {
    position: 'absolute',
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: 'rgba(212,160,23,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelCenterSymbol: {
    fontSize: fp(22),
  },

  /* Planet Nodes */
  planetNode: {
    position: 'absolute',
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetNodeRevealed: {
    backgroundColor: 'rgba(212,160,23,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.5)',
  },
  planetNodeHidden: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planetNodeText: {
    fontSize: fp(14),
    color: 'rgba(255,255,255,0.9)',
  },

  /* Phase Title */
  phaseTitle: {
    fontSize: fp(20),
    fontWeight: '600',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: hp(4),
  },
  phaseSub: {
    fontSize: fp(13),
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: hp(16),
  },

  /* Discovery Messages */
  discoveryBox: {
    width: '100%',
    gap: hp(4),
    marginBottom: hp(16),
  },
  discoveryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    paddingHorizontal: wp(12),
    paddingVertical: hp(4),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: wp(6),
  },
  discoveryArrow: {
    fontSize: fp(12),
    color: colors.accent.gold,
  },
  discoveryText: {
    fontSize: fp(13),
    color: 'rgba(255,255,255,0.85)',
  },

  /* Dosha Checklist */
  doshaChecklist: {
    width: '100%',
    gap: hp(4),
    marginBottom: hp(16),
  },
  doshaCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: wp(8),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  doshaCheckItemActive: {
    borderColor: 'rgba(212,160,23,0.3)',
    backgroundColor: 'rgba(212,160,23,0.05)',
  },
  doshaCheckItemDone: {
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  doshaCheckIcon: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doshaCheckIconActive: {
    borderColor: colors.accent.gold,
    backgroundColor: 'rgba(212,160,23,0.1)',
  },
  doshaCheckIconDone: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  doshaCheckIconText: {
    fontSize: fp(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  doshaCheckLabel: {
    fontSize: fp(13),
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  doshaCheckLabelDone: {
    color: 'rgba(255,255,255,0.5)',
  },

  /* Complete */
  completeSection: {
    alignItems: 'center',
    marginBottom: hp(20),
  },
  completeIcon: {
    fontSize: fp(40),
    marginBottom: hp(8),
  },
  completeTitle: {
    fontSize: fp(24),
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: hp(4),
  },
  completeSub: {
    fontSize: fp(14),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: hp(16),
    textAlign: 'center',
  },
  viewDiagnosisButton: {
    paddingHorizontal: wp(32),
    paddingVertical: hp(14),
    borderRadius: wp(12),
    backgroundColor: colors.accent.gold,
  },
  viewDiagnosisText: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.white,
  },

  /* Progress Bar */
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: hp(8),
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
    borderRadius: hp(3),
    backgroundColor: colors.accent.gold,
  },
  progressLabel: {
    fontSize: fp(12),
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});

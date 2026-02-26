import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import { getDiagnosis } from '../services/api';

// ---- Types ----

interface FreeRemedy {
  name: string;
  type: string;
  description: string;
  mantraText?: { roman: string; devanagari: string };
  frequency: string;
  duration: string;
}

interface DiagnosisData {
  id: string;
  root_dosha: string;
  severity: string;
  impacted_areas: { primary: string; secondary: string[] } | null;
  free_remedies: FreeRemedy[];
  full_remedies: { name: string; description: string }[];
  result: {
    rootDosha: string;
    rootPlanets?: string[];
    affectedHouses?: number[];
    severityLevel: string;
    responsivenessLevel?: string;
    isCommonlyAddressed?: boolean;
    impactedAreas?: { primary: string; secondary: string[] };
    positiveMessage?: string;
    freeRemedies?: FreeRemedy[];
    fullRemedies?: { name: string; description: string }[];
  } | null;
  problem_type: string;
  llm_provider: string;
}

// ---- Helpers ----

const SEVERITY_LABELS: Record<string, { hi: string; en: string; color: string }> = {
  significant: { hi: 'महत्वपूर्ण (Significant)', en: 'Significant', color: '#E67E22' },
  moderate: { hi: 'मध्यम (Moderate)', en: 'Moderate', color: '#F1C40F' },
  mild: { hi: 'हल्का (Mild)', en: 'Mild', color: '#2ECC71' },
};

const REMEDY_TYPE_ICONS: Record<string, string> = {
  mantra: '📿',
  fasting: '🕐',
  daan: '🙏',
  daily_practice: '🧘',
};

// ---- Component ----

export default function DiagnosisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; lang?: string }>();
  const diagnosisId = params.id || '';
  const lang = (params.lang || 'hi') as 'hi' | 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosisData | null>(null);

  useEffect(() => {
    if (!diagnosisId) {
      setError('No diagnosis ID');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await getDiagnosis(diagnosisId);
        setData(res.diagnosis as unknown as DiagnosisData);
      } catch (err) {
        console.error('[Diagnosis] Failed to load:', err);
        setError(lang === 'hi' ? 'Diagnosis load नहीं हो पाई' : 'Failed to load diagnosis');
      } finally {
        setLoading(false);
      }
    })();
  }, [diagnosisId, lang]);

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={s.loadingText}>
          {lang === 'hi' ? 'Diagnosis load हो रही है...' : 'Loading diagnosis...'}
        </Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity style={s.retryButton} onPress={() => router.push('/home')}>
          <Text style={s.retryText}>{lang === 'hi' ? 'वापस जाएं' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract data from the result object (LLM output) or top-level fields
  const result = data.result;
  const rootDosha = result?.rootDosha || data.root_dosha || 'Unknown';
  const severity = result?.severityLevel || data.severity || 'moderate';
  const severityInfo = SEVERITY_LABELS[severity] || SEVERITY_LABELS.moderate;
  const rootPlanets = result?.rootPlanets || [];
  const affectedHouses = result?.affectedHouses || [];
  const impactedAreas = result?.impactedAreas || data.impacted_areas;
  const positiveMessage = result?.positiveMessage || '';
  const isCommonlyAddressed = result?.isCommonlyAddressed ?? true;
  const responsiveness = result?.responsivenessLevel || 'responsive';
  const freeRemedies = result?.freeRemedies || data.free_remedies || [];
  const fullRemedies = result?.fullRemedies || data.full_remedies || [];

  const responsivenessLabel: Record<string, { hi: string; en: string }> = {
    highly_responsive: { hi: 'बहुत responsive', en: 'Highly Responsive' },
    responsive: { hi: 'Responsive', en: 'Responsive' },
    moderately_responsive: { hi: 'मध्यम responsive', en: 'Moderately Responsive' },
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => router.push('/home')}>
          <Text style={s.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {lang === 'hi' ? 'आपकी Diagnosis' : 'Your Diagnosis'}
        </Text>
        <View style={{ width: wp(32) }} />
      </View>

      <ScrollView
        style={s.scrollArea}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Diagnosis Card ---- */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderIcon}>📊</Text>
            <Text style={s.cardHeaderTitle}>
              {lang === 'hi' ? 'दोष विश्लेषण' : 'Dosha Analysis'}
            </Text>
          </View>

          {/* Root Dosha */}
          <View style={s.doshaRow}>
            <Text style={s.doshaLabel}>
              {lang === 'hi' ? 'मूल दोष:' : 'Root Dosha:'}
            </Text>
            <Text style={s.doshaValue}>{rootDosha}</Text>
          </View>

          {/* Root Planets */}
          {rootPlanets.length > 0 && (
            <View style={s.doshaRow}>
              <Text style={s.doshaLabel}>
                {lang === 'hi' ? 'प्रभावित ग्रह:' : 'Affected Planets:'}
              </Text>
              <Text style={s.doshaValue}>{rootPlanets.join(', ')}</Text>
            </View>
          )}

          {/* Affected Houses */}
          {affectedHouses.length > 0 && (
            <View style={s.doshaRow}>
              <Text style={s.doshaLabel}>
                {lang === 'hi' ? 'प्रभावित भाव:' : 'Affected Houses:'}
              </Text>
              <Text style={s.doshaValue}>
                {affectedHouses.map((h: number) => `${h}th`).join(', ')}
              </Text>
            </View>
          )}

          {/* Severity */}
          <View style={s.doshaRow}>
            <Text style={s.doshaLabel}>
              {lang === 'hi' ? 'दोष स्तर:' : 'Dosha Level:'}
            </Text>
            <View style={[s.severityBadge, { backgroundColor: severityInfo.color + '20' }]}>
              <Text style={[s.severityText, { color: severityInfo.color }]}>
                {lang === 'hi' ? severityInfo.hi : severityInfo.en}
              </Text>
            </View>
          </View>

          {/* Impacted Areas */}
          {impactedAreas && (
            <View style={s.impactedSection}>
              <Text style={s.impactedLabel}>
                {lang === 'hi' ? 'प्रभावित क्षेत्र:' : 'Impacted Areas:'}
              </Text>
              <Text style={s.impactedPrimary}>{impactedAreas.primary}</Text>
              {impactedAreas.secondary?.length > 0 && (
                <View style={s.secondaryList}>
                  {impactedAreas.secondary.map((area: string, i: number) => (
                    <Text key={i} style={s.secondaryItem}>• {area}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Badges */}
          <View style={s.badgesRow}>
            {isCommonlyAddressed && (
              <View style={s.badge}>
                <Text style={s.badgeIcon}>✓</Text>
                <Text style={s.badgeText}>
                  {lang === 'hi' ? 'आमतौर पर संबोधित' : 'Commonly Addressed'}
                </Text>
              </View>
            )}
            <View style={s.badge}>
              <Text style={s.badgeIcon}>✓</Text>
              <Text style={s.badgeText}>
                {lang === 'hi'
                  ? responsivenessLabel[responsiveness]?.hi || 'Responsive'
                  : responsivenessLabel[responsiveness]?.en || 'Responsive'}
              </Text>
            </View>
          </View>

          {/* Positive Message */}
          {positiveMessage && (
            <View style={s.positiveBox}>
              <Text style={s.positiveText}>{positiveMessage}</Text>
            </View>
          )}
        </View>

        {/* ---- Free Remedies ---- */}
        {freeRemedies.length > 0 && (
          <View style={s.sectionHeader}>
            <Text style={s.sectionIcon}>📿</Text>
            <Text style={s.sectionTitle}>
              {lang === 'hi' ? 'निःशुल्क उपाय' : 'Free Remedies'}
            </Text>
          </View>
        )}

        {freeRemedies.map((remedy: FreeRemedy, index: number) => (
          <View key={index} style={s.remedyCard}>
            <View style={s.remedyHeader}>
              <Text style={s.remedyIcon}>
                {REMEDY_TYPE_ICONS[remedy.type] || '📿'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={s.remedyName}>{remedy.name}</Text>
                <Text style={s.remedyType}>
                  {remedy.type?.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={s.remedyDesc}>{remedy.description}</Text>

            {remedy.mantraText && (
              <View style={s.mantraBox}>
                <Text style={s.mantraDevanagari}>
                  {remedy.mantraText.devanagari}
                </Text>
                <Text style={s.mantraRoman}>
                  {remedy.mantraText.roman}
                </Text>
              </View>
            )}

            <View style={s.remedyMeta}>
              <View style={s.remedyMetaItem}>
                <Text style={s.remedyMetaLabel}>
                  {lang === 'hi' ? 'कितनी बार:' : 'Frequency:'}
                </Text>
                <Text style={s.remedyMetaValue}>{remedy.frequency}</Text>
              </View>
              <View style={s.remedyMetaItem}>
                <Text style={s.remedyMetaLabel}>
                  {lang === 'hi' ? 'अवधि:' : 'Duration:'}
                </Text>
                <Text style={s.remedyMetaValue}>{remedy.duration}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* ---- Paywall / Locked Section ---- */}
        <View style={s.paywallCard}>
          <View style={s.paywallHeader}>
            <Text style={s.paywallIcon}>🔒</Text>
            <Text style={s.paywallTitle}>
              {lang === 'hi' ? 'सम्पूर्ण उपाय योजना' : 'Complete Remedy Plan'}
            </Text>
          </View>

          <Text style={s.paywallSub}>
            {lang === 'hi'
              ? 'पूरी plan में शामिल है:'
              : 'The full plan includes:'}
          </Text>

          {fullRemedies.slice(0, 4).map((r: { name: string; description: string }, i: number) => (
            <View key={i} style={s.lockedItem}>
              <Text style={s.lockedIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.lockedName}>{r.name}</Text>
                <Text style={s.lockedDesc}>{r.description}</Text>
              </View>
            </View>
          ))}

          {fullRemedies.length === 0 && (
            <>
              <View style={s.lockedItem}>
                <Text style={s.lockedIcon}>🔒</Text>
                <Text style={s.lockedName}>
                  {lang === 'hi' ? '9-सप्ताह विस्तृत protocol' : '9-week detailed protocol'}
                </Text>
              </View>
              <View style={s.lockedItem}>
                <Text style={s.lockedIcon}>🔒</Text>
                <Text style={s.lockedName}>
                  {lang === 'hi' ? 'विशेष मंत्र और पूजा विधि' : 'Special mantras & puja vidhi'}
                </Text>
              </View>
              <View style={s.lockedItem}>
                <Text style={s.lockedIcon}>🔒</Text>
                <Text style={s.lockedName}>
                  {lang === 'hi' ? 'अनुकूल समय और तिथि' : 'Auspicious timing & dates'}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity style={s.unlockButton} activeOpacity={0.8}>
            <Text style={s.unlockButtonText}>
              {lang === 'hi' ? 'सम्पूर्ण Plan Unlock करें' : 'Unlock Complete Plan'}
            </Text>
            <Text style={s.unlockPriceRow}>
              <Text style={s.unlockPrice}>{'₹199 '}</Text>
              <Text style={s.unlockOriginal}>{'₹499'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: hp(40) }} />
      </ScrollView>
    </View>
  );
}

// ---- Styles ----

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
    gap: hp(12),
  },
  loadingText: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
  },
  errorText: {
    fontSize: fp(16),
    color: colors.neutral.grey600,
    textAlign: 'center',
    marginBottom: hp(16),
  },
  retryButton: {
    paddingHorizontal: wp(24),
    paddingVertical: hp(10),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(8),
  },
  retryText: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.white,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(10),
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey100,
  },
  backButton: {
    padding: wp(6),
  },
  backArrow: {
    fontSize: fp(20),
    color: colors.neutral.grey700,
  },
  headerTitle: {
    fontSize: fp(18),
    fontWeight: '600',
    color: colors.secondary.maroon,
  },

  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
  },

  /* Diagnosis Card */
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(16),
    padding: wp(16),
    marginBottom: hp(16),
    borderWidth: 1,
    borderColor: colors.neutral.grey100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(12),
  },
  cardHeaderIcon: { fontSize: fp(18) },
  cardHeaderTitle: {
    fontSize: fp(18),
    fontWeight: '700',
    color: colors.secondary.maroon,
  },
  doshaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(8),
  },
  doshaLabel: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey500,
  },
  doshaValue: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey800,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(3),
    borderRadius: wp(12),
  },
  severityText: {
    fontSize: fp(12),
    fontWeight: '600',
  },
  impactedSection: {
    marginTop: hp(4),
    marginBottom: hp(8),
  },
  impactedLabel: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey500,
    marginBottom: hp(4),
  },
  impactedPrimary: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey800,
    marginBottom: hp(2),
  },
  secondaryList: { marginTop: hp(2) },
  secondaryItem: {
    fontSize: fp(13),
    color: colors.neutral.grey600,
    marginBottom: hp(1),
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    marginTop: hp(8),
    marginBottom: hp(8),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    backgroundColor: '#E8F5E9',
    borderRadius: wp(16),
  },
  badgeIcon: {
    fontSize: fp(11),
    color: '#2ECC71',
    fontWeight: '700',
  },
  badgeText: {
    fontSize: fp(11),
    fontWeight: '500',
    color: '#2E7D32',
  },
  positiveBox: {
    marginTop: hp(8),
    padding: wp(12),
    backgroundColor: '#FFF8E1',
    borderRadius: wp(10),
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
  },
  positiveText: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey700,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(12),
  },
  sectionIcon: { fontSize: fp(18) },
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '700',
    color: colors.secondary.maroon,
  },

  /* Remedy Card */
  remedyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(12),
    padding: wp(14),
    marginBottom: hp(12),
    borderWidth: 1,
    borderColor: colors.neutral.grey100,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    marginBottom: hp(8),
  },
  remedyIcon: { fontSize: fp(22) },
  remedyName: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  remedyType: {
    fontSize: fp(10),
    fontWeight: '500',
    color: colors.primary.saffron,
    letterSpacing: 0.5,
  },
  remedyDesc: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey600,
    marginBottom: hp(8),
  },
  mantraBox: {
    backgroundColor: '#FFF8F0',
    padding: wp(12),
    borderRadius: wp(8),
    marginBottom: hp(8),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.saffron,
  },
  mantraDevanagari: {
    fontSize: fp(16),
    lineHeight: fp(16) * 1.6,
    color: colors.secondary.maroon,
    fontWeight: '500',
    marginBottom: hp(4),
  },
  mantraRoman: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    fontStyle: 'italic',
  },
  remedyMeta: {
    flexDirection: 'row',
    gap: wp(16),
  },
  remedyMetaItem: {
    flexDirection: 'row',
    gap: wp(4),
  },
  remedyMetaLabel: {
    fontSize: fp(12),
    color: colors.neutral.grey400,
  },
  remedyMetaValue: {
    fontSize: fp(12),
    fontWeight: '500',
    color: colors.neutral.grey700,
  },

  /* Paywall */
  paywallCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(16),
    padding: wp(16),
    marginTop: hp(8),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderStyle: 'dashed',
  },
  paywallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(8),
  },
  paywallIcon: { fontSize: fp(18) },
  paywallTitle: {
    fontSize: fp(16),
    fontWeight: '700',
    color: colors.neutral.grey700,
  },
  paywallSub: {
    fontSize: fp(13),
    color: colors.neutral.grey500,
    marginBottom: hp(10),
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(8),
    marginBottom: hp(8),
    opacity: 0.6,
  },
  lockedIcon: { fontSize: fp(14) },
  lockedName: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey600,
  },
  lockedDesc: {
    fontSize: fp(11),
    color: colors.neutral.grey400,
    marginTop: hp(1),
  },
  unlockButton: {
    marginTop: hp(12),
    paddingVertical: hp(14),
    borderRadius: wp(12),
    backgroundColor: colors.accent.gold,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: fp(16),
    fontWeight: '700',
    color: colors.neutral.white,
  },
  unlockPriceRow: {
    marginTop: hp(2),
  },
  unlockPrice: {
    fontSize: fp(18),
    fontWeight: '700',
    color: colors.neutral.white,
  },
  unlockOriginal: {
    fontSize: fp(13),
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
});

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  colors,
  PRICING,
  type SeverityLevel,
  type ResponsivenessLevel,
  type FreeRemedy,
  type PaidRemedyPreview,
} from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---- Mock diagnosis data (simulates real API response) ----

function generateMockDiagnosis(problemType: string, language: 'hi' | 'en') {
  const doshaMap: Record<string, { rootDosha: string; rootPlanets: string[]; houses: number[]; primary: string; secondary: string[] }> = {
    marriage_delay: {
      rootDosha: 'mangal',
      rootPlanets: ['Mars', 'Saturn'],
      houses: [7],
      primary: language === 'hi' ? 'शादी और रिश्ते (Primary)' : 'Marriage & Relationships (Primary)',
      secondary: [language === 'hi' ? 'मानसिक शांति (Secondary)' : 'Mental Peace (Secondary)'],
    },
    career_stuck: {
      rootDosha: 'shani',
      rootPlanets: ['Saturn', 'Rahu'],
      houses: [10],
      primary: language === 'hi' ? 'करियर और पेशा (Primary)' : 'Career & Profession (Primary)',
      secondary: [language === 'hi' ? 'आर्थिक स्थिति (Secondary)' : 'Financial Stability (Secondary)'],
    },
    money_problems: {
      rootDosha: 'rahu_ketu',
      rootPlanets: ['Rahu', 'Saturn'],
      houses: [2, 11],
      primary: language === 'hi' ? 'आर्थिक स्थिरता (Primary)' : 'Financial Stability (Primary)',
      secondary: [language === 'hi' ? 'करियर (Secondary)' : 'Career (Secondary)'],
    },
    health_issues: {
      rootDosha: 'shani',
      rootPlanets: ['Saturn', 'Mars'],
      houses: [6],
      primary: language === 'hi' ? 'स्वास्थ्य (Primary)' : 'Health (Primary)',
      secondary: [language === 'hi' ? 'मानसिक शांति (Secondary)' : 'Mental Peace (Secondary)'],
    },
    legal_matters: {
      rootDosha: 'rahu_ketu',
      rootPlanets: ['Rahu', 'Mars'],
      houses: [6, 8],
      primary: language === 'hi' ? 'कानूनी विवाद (Primary)' : 'Legal Matters (Primary)',
      secondary: [language === 'hi' ? 'आर्थिक स्थिरता (Secondary)' : 'Financial Stability (Secondary)'],
    },
    family_conflict: {
      rootDosha: 'pitra',
      rootPlanets: ['Sun', 'Rahu'],
      houses: [4],
      primary: language === 'hi' ? 'पारिवारिक सद्भाव (Primary)' : 'Family Harmony (Primary)',
      secondary: [language === 'hi' ? 'मानसिक शांति (Secondary)' : 'Mental Peace (Secondary)'],
    },
  };

  const info = doshaMap[problemType] || doshaMap.marriage_delay;

  const doshaNames: Record<string, Record<string, string>> = {
    mangal: { hi: 'मंगल दोष', en: 'Mangal Dosha' },
    shani: { hi: 'शनि दोष', en: 'Shani Dosha' },
    rahu_ketu: { hi: 'राहु-केतु दोष', en: 'Rahu-Ketu Dosha' },
    pitra: { hi: 'पितृ दोष', en: 'Pitra Dosha' },
    kaal_sarp: { hi: 'काल सर्प योग', en: 'Kaal Sarp Yog' },
  };

  const doshaDisplayName = doshaNames[info.rootDosha]?.[language] || info.rootDosha;

  const positiveMessages: Record<string, Record<string, string>> = {
    marriage_delay: {
      hi: 'यह दोष बहुत common है — लाखों लोगों ने successfully इसका remedy किया है। सही approach से इसके effects 60-70% तक कम हो सकते हैं।',
      en: 'This dosha is very common — millions of people have successfully addressed it. With the right approach, its effects can be reduced by 60-70%.',
    },
    career_stuck: {
      hi: 'यह एक temporary phase है। सही remedies से breakthrough बहुत possible है। बहुत से लोगों ने इससे निकलकर बड़ी success पाई है।',
      en: 'This is a temporary phase. A breakthrough is very possible with the right remedies. Many people have overcome this and achieved great success.',
    },
    money_problems: {
      hi: 'Financial planets का दबाव temporary है। सही remedies से financial flow improve होता है। बहुत लोगों ने इसका सफल remedy किया है।',
      en: 'Financial planetary pressure is temporary. The right remedies can improve financial flow. Many people have successfully addressed this.',
    },
    health_issues: {
      hi: 'Health पर planetary influence temporary है। Remedies + medical care दोनों मिलकर best results देते हैं।',
      en: 'Planetary influence on health is temporary. Remedies combined with medical care give the best results.',
    },
    legal_matters: {
      hi: 'कानूनी मामलों में planetary positions बताती हैं कि favorable period आने वाला है। Remedies से outcomes बेहतर होते हैं।',
      en: 'In legal matters, planetary positions indicate a favorable period is approaching. Remedies can improve outcomes.',
    },
    family_conflict: {
      hi: 'पारिवारिक तनाव planetary influence से बढ़ता है। सही remedies से घर का माहौल काफ़ी हद तक सुधर सकता है।',
      en: 'Family tension is amplified by planetary influence. The right remedies can significantly improve the household atmosphere.',
    },
  };

  const remedyTemplates: Record<string, FreeRemedy[]> = {
    marriage_delay: [
      {
        id: 'r1',
        name: language === 'hi' ? 'मंगल मंत्र (Daily)' : 'Mangal Mantra (Daily)',
        type: 'mantra',
        description: language === 'hi'
          ? 'हर मंगलवार सुबह 10 बजे से पहले 108 बार जपें। 9 मंगलवार तक करें।'
          : 'Recite 108 times every Tuesday morning before 10 AM. Duration: 9 Tuesdays.',
        mantraText: {
          roman: 'Om Kraam Kreem Kraum Sah Bhaumaaya Namah',
          devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
        },
        frequency: language === 'hi' ? '108 बार, हर मंगलवार' : '108 times, every Tuesday',
        duration: language === 'hi' ? '9 मंगलवार' : '9 Tuesdays',
      },
      {
        id: 'r2',
        name: language === 'hi' ? 'मंगलवार व्रत' : 'Tuesday Fasting',
        type: 'fasting',
        description: language === 'hi'
          ? 'हर मंगलवार सूर्यास्त के बाद ही खाएं। फल खा सकते हैं। नमक न खाएं।'
          : 'Every Tuesday, eat only after sunset. Fruits allowed. Avoid salt.',
        frequency: language === 'hi' ? 'हर मंगलवार' : 'Every Tuesday',
        duration: language === 'hi' ? '9 मंगलवार' : '9 Tuesdays',
      },
      {
        id: 'r3',
        name: language === 'hi' ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)',
        type: 'daily_practice',
        description: language === 'hi'
          ? 'रोज़ सुबह एक बार पढ़ें। यह Mars को positively strengthen करता है।'
          : 'Read once daily, preferably in the morning. Strengthens Mars positively.',
        frequency: language === 'hi' ? 'रोज़ 1 बार' : 'Once daily',
        duration: language === 'hi' ? '9 हफ़्ते' : '9 weeks',
      },
    ],
    career_stuck: [
      {
        id: 'r1',
        name: language === 'hi' ? 'शनि मंत्र (Daily)' : 'Shani Mantra (Daily)',
        type: 'mantra',
        description: language === 'hi'
          ? 'हर शनिवार शाम को 108 बार जपें। 11 शनिवार तक करें।'
          : 'Recite 108 times every Saturday evening. Duration: 11 Saturdays.',
        mantraText: {
          roman: 'Om Praam Preem Praum Sah Shanaischaraaya Namah',
          devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
        },
        frequency: language === 'hi' ? '108 बार, हर शनिवार' : '108 times, every Saturday',
        duration: language === 'hi' ? '11 शनिवार' : '11 Saturdays',
      },
      {
        id: 'r2',
        name: language === 'hi' ? 'शनिवार व्रत' : 'Saturday Fasting',
        type: 'fasting',
        description: language === 'hi'
          ? 'हर शनिवार सूर्यास्त तक उपवास करें। काले तिल का दान करें।'
          : 'Fast every Saturday until sunset. Donate black sesame seeds.',
        frequency: language === 'hi' ? 'हर शनिवार' : 'Every Saturday',
        duration: language === 'hi' ? '11 शनिवार' : '11 Saturdays',
      },
      {
        id: 'r3',
        name: language === 'hi' ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)',
        type: 'daily_practice',
        description: language === 'hi'
          ? 'रोज़ सुबह एक बार पढ़ें। Saturn के negative effects को balance करता है।'
          : 'Read once daily in the morning. Balances negative effects of Saturn.',
        frequency: language === 'hi' ? 'रोज़ 1 बार' : 'Once daily',
        duration: language === 'hi' ? '9 हफ़्ते' : '9 weeks',
      },
    ],
    default: [
      {
        id: 'r1',
        name: language === 'hi' ? 'नवग्रह मंत्र (Daily)' : 'Navagraha Mantra (Daily)',
        type: 'mantra',
        description: language === 'hi'
          ? 'रोज़ सुबह 9 बार जपें। सभी ग्रहों को balance करता है।'
          : 'Recite 9 times every morning. Balances all planetary influences.',
        mantraText: {
          roman: 'Om Navagrahaaya Vidmahe Navaratnaya Dheemahi Tanno Graha Prachodayat',
          devanagari: 'ॐ नवग्रहाय विद्महे नवरत्नाय धीमहि तन्नो ग्रह प्रचोदयात्',
        },
        frequency: language === 'hi' ? '9 बार, रोज़ सुबह' : '9 times, every morning',
        duration: language === 'hi' ? '9 हफ़्ते' : '9 weeks',
      },
      {
        id: 'r2',
        name: language === 'hi' ? 'दान (Weekly)' : 'Daan / Donation (Weekly)',
        type: 'daan',
        description: language === 'hi'
          ? 'हर हफ़्ते गरीबों को अनाज या कपड़े दान करें। छोटी राशि भी प्रभावशाली है।'
          : 'Donate grains or clothes to the needy weekly. Even small amounts are effective.',
        frequency: language === 'hi' ? 'हर हफ़्ते' : 'Weekly',
        duration: language === 'hi' ? '9 हफ़्ते' : '9 weeks',
      },
      {
        id: 'r3',
        name: language === 'hi' ? 'ध्यान / Meditation (Daily)' : 'Meditation (Daily)',
        type: 'daily_practice',
        description: language === 'hi'
          ? 'रोज़ 10-15 मिनट शांत बैठकर ध्यान करें। मन की शांति और ग्रह प्रभाव दोनों में मदद करता है।'
          : 'Meditate quietly for 10-15 minutes daily. Helps with mental peace and planetary influence.',
        frequency: language === 'hi' ? 'रोज़ 10-15 मिनट' : 'Daily, 10-15 minutes',
        duration: language === 'hi' ? '9 हफ़्ते' : '9 weeks',
      },
    ],
  };

  const paidRemedyPreviews: PaidRemedyPreview[] = [
    {
      id: 'p1',
      name: language === 'hi' ? 'Detailed दोष analysis + planetary positions' : 'Detailed dosha analysis with specific planetary positions',
      description: language === 'hi'
        ? 'कौनसा ग्रह exactly कहाँ है और कैसे affect कर रहा है'
        : 'Which planet is exactly where and how it affects you',
      isLocked: true,
    },
    {
      id: 'p2',
      name: language === 'hi' ? 'Exact timeline — कब effects कम होंगे' : 'Marriage/career timeline — when pressure will reduce',
      description: language === 'hi'
        ? 'कब तक pressure रहेगा, कब relief आयेगा'
        : 'How long the pressure will last, when relief will come',
      isLocked: true,
    },
    {
      id: 'p3',
      name: language === 'hi' ? 'Specific temple + पूजा recommendation' : 'Specific temple recommendations for your chart',
      description: language === 'hi'
        ? 'कौनसा temple आपके chart के लिए सबसे powerful है और क्यों'
        : 'Which temple is most powerful for your chart and why',
      isLocked: true,
    },
    {
      id: 'p4',
      name: language === 'hi' ? 'Best muhurta (auspicious timing)' : 'Best dates (muhurta) for maximum effectiveness',
      description: language === 'hi'
        ? 'Exact दिन और समय जब remedies सबसे ज़्यादा effective होंगी'
        : 'Exact day and time when remedies will be most effective',
      isLocked: true,
    },
    {
      id: 'p5',
      name: language === 'hi' ? 'Recommended gemstones + yantra' : 'Product recommendations matched to your chart',
      description: language === 'hi'
        ? 'आपकी specific chart के हिसाब से कौनसा रत्न या यंत्र सही रहेगा'
        : 'Which gemstone or yantra is right based on your specific chart',
      isLocked: true,
    },
    {
      id: 'p6',
      name: language === 'hi' ? 'Complete 9-week structured protocol' : 'Complete 9-week structured protocol with milestones',
      description: language === 'hi'
        ? 'हफ़्ते-दर-हफ़्ते पूरा remedy plan with weekly milestones'
        : 'Week-by-week complete remedy plan with weekly milestones',
      isLocked: true,
    },
  ];

  return {
    doshaDisplayName,
    rootPlanets: info.rootPlanets,
    affectedHouses: info.houses,
    primaryImpact: info.primary,
    secondaryImpacts: info.secondary,
    severityLevel: 'significant' as SeverityLevel,
    responsivenessLevel: 'highly_responsive' as ResponsivenessLevel,
    isCommonlyAddressed: true,
    positiveMessage: positiveMessages[problemType]?.[language] || positiveMessages.marriage_delay[language],
    currentDasha: {
      main: language === 'hi' ? 'शनि महादशा' : 'Shani Mahadasha',
      sub: language === 'hi' ? 'राहु अंतर्दशा' : 'Rahu Antardasha',
      endDate: 'Oct 2027',
    },
    freeRemedies: remedyTemplates[problemType] || remedyTemplates.default,
    paidRemedyPreviews,
  };
}

// ---- Helpers ----

const REMEDY_TYPE_ICONS: Record<string, string> = {
  mantra: '\uD83D\uDCFF',
  fasting: '\uD83C\uDF7D\uFE0F',
  daan: '\uD83C\uDF81',
  daily_practice: '\uD83E\uDDD8',
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  significant: 'Significant',
  moderate: 'Moderate',
  mild: 'Mild',
};

const RESPONSIVENESS_LABELS: Record<ResponsivenessLevel, string> = {
  highly_responsive: 'Highly responsive',
  responsive: 'Responsive',
  moderately_responsive: 'Moderately responsive',
};

// ---- Component ----

export default function DiagnosisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    problem?: string;
    lang?: string;
    dob?: string;
    place?: string;
  }>();

  const problemType = params.problem || 'marriage_delay';
  const dob = params.dob || '';
  const place = params.place || '';

  const [language, setLanguage] = useState<'hi' | 'en'>((params.lang as 'hi' | 'en') || 'hi');
  const [trackerAdded, setTrackerAdded] = useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('upaya_language');
        if (stored === 'hi' || stored === 'en') setLanguage(stored);
      } catch { /* default */ }
    };
    load();
  }, []);

  const diagnosis = useMemo(
    () => generateMockDiagnosis(problemType, language),
    [problemType, language],
  );

  const socialProofCount = useMemo(() => Math.floor(8000 + Math.random() * 8000), []);

  const handleAddToTracker = useCallback((remedyId: string) => {
    setTrackerAdded((prev) => {
      const next = new Set(prev);
      next.add(remedyId);
      return next;
    });
  }, []);

  const handleUnlockPlan = useCallback(() => {
    router.push({
      pathname: '/paywall',
      params: { problem: problemType, lang: language, dob, place },
    });
  }, [router, problemType, language, dob, place]);

  const handleAskMore = useCallback(() => {
    router.push({ pathname: '/chat', params: { problem: problemType } });
  }, [router, problemType]);

  const handleShare = useCallback(async () => {
    const shareText = language === 'hi'
      ? `📊 मेरी कुंडली में ${diagnosis.doshaDisplayName} मिला — ${diagnosis.rootPlanets.join(' + ')} ${diagnosis.affectedHouses.join(', ')}th house में।\n\nयह mantra suggest हुआ:\n"${diagnosis.freeRemedies[0]?.mantraText?.roman || ''}"\n\nअपनी कुंडली भी free में check करो: https://upaya.app`
      : `📊 My kundli shows ${diagnosis.doshaDisplayName} — ${diagnosis.rootPlanets.join(' + ')} in ${diagnosis.affectedHouses.join(', ')}th house.\n\nSuggested mantra:\n"${diagnosis.freeRemedies[0]?.mantraText?.roman || ''}"\n\nCheck your kundli for free: https://upaya.app`;

    try {
      await Share.share({ message: shareText });
    } catch { /* user cancelled */ }
  }, [diagnosis, language]);

  const houseLabel = (houses: number[]) => {
    const h = houses.join(', ');
    if (problemType === 'marriage_delay') return `${h}th house (marriage house)`;
    if (problemType === 'career_stuck') return `${h}th house (career house)`;
    return `${h}th house`;
  };

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Text style={s.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Upaya AI</Text>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
          <Text style={s.shareBtnText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== PART 1: Diagnosis Card ===== */}
        <View style={s.diagnosisCard}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderIcon}>📊</Text>
            <Text style={s.cardTitle}>
              {language === 'hi' ? 'आपकी कुंडली Diagnosis' : 'YOUR KUNDLI DIAGNOSIS'}
            </Text>
          </View>

          <View style={s.divider} />

          {/* Root cause */}
          <View style={s.section}>
            <View style={s.sectionLabel}>
              <Text style={s.sectionIcon}>🔍</Text>
              <Text style={s.sectionTitle}>Root Cause Identified</Text>
            </View>
            <Text style={s.rootCauseText}>
              <Text style={s.bold}>{diagnosis.rootPlanets.join(' + ')}</Text>
              {' '}
              {language === 'hi'
                ? `दोनों आपके ${houseLabel(diagnosis.affectedHouses)} में`
                : `both in your ${houseLabel(diagnosis.affectedHouses)}`}
            </Text>
          </View>

          {/* Current Dasha */}
          <View style={s.section}>
            <Text style={s.dashaLabel}>
              {language === 'hi' ? 'Currently running:' : 'Currently running:'}
            </Text>
            <Text style={s.dashaText}>
              {diagnosis.currentDasha.main} → {diagnosis.currentDasha.sub}
            </Text>
            <Text style={s.dashaEnd}>(active until {diagnosis.currentDasha.endDate})</Text>
          </View>

          {/* Impacted areas */}
          <View style={s.section}>
            <View style={s.sectionLabel}>
              <Text style={s.sectionIcon}>🎯</Text>
              <Text style={s.sectionTitle}>Impacted Areas</Text>
            </View>
            <View style={s.impactList}>
              <View style={s.impactItem}>
                <View style={s.impactDot} />
                <Text style={s.impactText}>{diagnosis.primaryImpact}</Text>
              </View>
              {diagnosis.secondaryImpacts.map((impact, i) => (
                <View key={i} style={s.impactItem}>
                  <View style={s.impactDot} />
                  <Text style={s.impactText}>{impact}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Dosha Assessment */}
          <View style={s.section}>
            <View style={s.sectionLabel}>
              <Text style={s.sectionIcon}>📋</Text>
              <Text style={s.sectionTitle}>Dosha Assessment</Text>
            </View>
            <View style={s.assessmentGrid}>
              <View style={s.assessmentRow}>
                <Text style={s.assessmentLabel}>Dosha Level:</Text>
                <Text style={s.assessmentValue}>
                  {SEVERITY_LABELS[diagnosis.severityLevel]}
                </Text>
              </View>
              <View style={s.assessmentRow}>
                <Text style={s.assessmentLabel}>Commonly addressed?</Text>
                <Text style={[s.assessmentValue, s.assessmentPositive]}>
                  ✅ YES
                </Text>
              </View>
              <View style={s.assessmentRow}>
                <Text style={s.assessmentLabel}>Responsive to remedies?</Text>
                <Text style={[s.assessmentValue, s.assessmentPositive]}>
                  ✅ {RESPONSIVENESS_LABELS[diagnosis.responsivenessLevel]}
                </Text>
              </View>
            </View>
          </View>

          {/* Positive message */}
          <View style={s.positiveMsg}>
            <Text style={s.positiveMsgText}>{diagnosis.positiveMessage}</Text>
          </View>
        </View>

        {/* ===== PART 2: Free Remedies ===== */}
        <View style={s.freeSection}>
          <View style={s.freeSectionHeader}>
            <Text style={s.freeBadge}>🟢</Text>
            <Text style={s.freeSectionTitle}>
              {language === 'hi'
                ? 'आज ही अपनी Remedies शुरू करें (FREE)'
                : 'START YOUR REMEDIES TODAY (FREE)'}
            </Text>
          </View>

          <Text style={s.freeSubtitle}>
            {language === 'hi'
              ? 'ये remedies आप आज ही शुरू कर सकते हैं — बिल्कुल free। इन्हें शुरू करने से planetary pressure कम होने लगता है।'
              : "These remedies you can start today — completely free. Starting these begins reducing planetary pressure."}
          </Text>

          {diagnosis.freeRemedies.map((remedy, index) => {
            const isAdded = trackerAdded.has(remedy.id);
            return (
              <View key={remedy.id} style={s.remedyCard}>
                <View style={s.remedyHeader}>
                  <Text style={s.remedyNumber}>{index + 1}.</Text>
                  <Text style={s.remedyIcon}>{REMEDY_TYPE_ICONS[remedy.type] || '📿'}</Text>
                  <Text style={s.remedyName}>{remedy.name}</Text>
                </View>

                {remedy.mantraText && (
                  <View style={s.mantraBlock}>
                    <Text style={s.mantraRoman}>"{remedy.mantraText.roman}"</Text>
                    <Text style={s.mantraDevanagari}>{remedy.mantraText.devanagari}</Text>
                  </View>
                )}

                <Text style={s.remedyDesc}>{remedy.description}</Text>

                <View style={s.remedyMeta}>
                  <View style={s.remedyMetaItem}>
                    <Text style={s.remedyMetaIcon}>🔄</Text>
                    <Text style={s.remedyMetaText}>{remedy.frequency}</Text>
                  </View>
                  <View style={s.remedyMetaItem}>
                    <Text style={s.remedyMetaIcon}>📅</Text>
                    <Text style={s.remedyMetaText}>{remedy.duration}</Text>
                  </View>
                </View>

                <View style={s.remedyActions}>
                  {remedy.mantraText && (
                    <TouchableOpacity style={s.listenBtn} activeOpacity={0.7}>
                      <Text style={s.listenBtnText}>
                        ▶️ {language === 'hi' ? 'उच्चारण सुनें' : 'Listen'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[s.trackerBtn, isAdded && s.trackerBtnAdded]}
                    onPress={() => handleAddToTracker(remedy.id)}
                    disabled={isAdded}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.trackerBtnText, isAdded && s.trackerBtnTextAdded]}>
                      {isAdded ? '✅ ' : '➕ '}
                      {isAdded
                        ? (language === 'hi' ? 'Tracker में Added' : 'Added to Tracker')
                        : (language === 'hi' ? 'Tracker में Add करें' : 'Add to Tracker')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={s.freeFooter}>
            <Text style={s.freeFooterText}>
              {language === 'hi'
                ? '✅ "यह आपका foundation है। इन्हें आज से शुरू करें — planetary pressure कम होना start होगा।"'
                : '✅ "This is your foundation. Start these today — planetary pressure will begin to reduce."'}
            </Text>
          </View>
        </View>

        {/* ===== PART 3: Complete Plan Upsell ===== */}
        <View style={s.upsellSection}>
          <View style={s.upsellHeader}>
            <Text style={s.upsellBadge}>✨</Text>
            <Text style={s.upsellTitle}>COMPLETE OPTIMIZED PLAN</Text>
          </View>

          <Text style={s.upsellSubtitle}>
            {language === 'hi'
              ? 'आप free remedies शुरू कर रहे हैं — great start! Complete plan से आपको मिलेगा:'
              : "You're starting free remedies — great start! With the complete plan you'll get:"}
          </Text>

          {diagnosis.paidRemedyPreviews.map((item) => (
            <View key={item.id} style={s.lockedItem}>
              <Text style={s.lockedIcon}>🔒</Text>
              <View style={s.lockedContent}>
                <Text style={s.lockedName}>{item.name}</Text>
                <Text style={s.lockedDesc}>{item.description}</Text>
              </View>
            </View>
          ))}

          <Text style={s.socialProof}>
            👥 {language === 'hi'
              ? `${socialProofCount.toLocaleString()} users with similar charts ने unlock किया`
              : `${socialProofCount.toLocaleString()} users with similar charts unlocked their plan`}
          </Text>

          <TouchableOpacity style={s.unlockBtn} onPress={handleUnlockPlan} activeOpacity={0.8}>
            <Text style={s.unlockBtnIcon}>✨</Text>
            <Text style={s.unlockBtnLabel}>
              {language === 'hi' ? 'Complete Plan Unlock करें' : 'Unlock Complete Plan'}
            </Text>
            <View style={s.unlockPriceRow}>
              <Text style={s.unlockPrice}>₹{PRICING.fullRemedyReport.displayAmount}</Text>
              <Text style={s.unlockOrigPrice}>₹{PRICING.fullRemedyReport.originalDisplayAmount}</Text>
            </View>
          </TouchableOpacity>

          <Text style={s.privacyBadge}>
            🔒 100% Private · Encrypted Data
          </Text>
        </View>

        {/* ===== AI Follow-Up ===== */}
        <View style={s.aiFollowUp}>
          <View style={s.aiFollowUpRow}>
            <View style={s.aiAvatar}>
              <Text style={s.aiAvatarText}>🙏</Text>
            </View>
            <View style={s.aiFollowUpBubble}>
              <Text style={s.aiFollowUpText}>
                {language === 'hi'
                  ? 'आपका diagnosis clear है। मैंने 3 remedies free में suggest की हैं — आप आज से शुरू कर सकते हैं।\n\nComplete plan में specific temples aur timing भी मिलेगा — जो results को और powerful बनाता है।'
                  : "Your diagnosis is clear. I've suggested 3 free remedies — you can start today.\n\nThe complete plan also includes specific temples and timing — which makes results even more powerful."}
              </Text>

              <View style={s.ctaPaths}>
                <TouchableOpacity
                  style={s.ctaPathBtn}
                  onPress={() => diagnosis.freeRemedies.forEach((r) => handleAddToTracker(r.id))}
                  activeOpacity={0.7}
                >
                  <Text style={s.ctaPathText}>
                    📿 {language === 'hi'
                      ? 'Free remedies Tracker में add करें'
                      : 'Add free remedies to tracker'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.ctaPathBtn, s.ctaPathPrimary]}
                  onPress={handleUnlockPlan}
                  activeOpacity={0.8}
                >
                  <Text style={[s.ctaPathText, s.ctaPathPrimaryText]}>
                    ✨ {language === 'hi'
                      ? `Complete plan unlock करें ₹${PRICING.fullRemedyReport.displayAmount}`
                      : `Unlock complete plan ₹${PRICING.fullRemedyReport.displayAmount}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.ctaPathBtn} onPress={handleAskMore} activeOpacity={0.7}>
                  <Text style={s.ctaPathText}>
                    💬 {language === 'hi' ? 'कुछ और पूछना है' : 'I have more questions'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ===== Share Card ===== */}
        <View style={s.shareCard}>
          <Text style={s.shareCardText}>
            {language === 'hi'
              ? `📊 मेरी कुंडली में ${diagnosis.doshaDisplayName} मिला — ${diagnosis.rootPlanets.join(' + ')} ${diagnosis.affectedHouses.join(', ')}th house में।`
              : `📊 My kundli shows ${diagnosis.doshaDisplayName} — ${diagnosis.rootPlanets.join(' + ')} in ${diagnosis.affectedHouses.join(', ')}th house.`}
          </Text>
          {diagnosis.freeRemedies[0]?.mantraText && (
            <Text style={s.shareCardMantra}>
              {language === 'hi' ? 'यह mantra suggest हुआ:' : 'Suggested mantra:'}
              {'\n'}"{diagnosis.freeRemedies[0].mantraText.roman}"
            </Text>
          )}
          <Text style={s.shareCardCta}>
            {language === 'hi'
              ? 'अपनी कुंडली भी free में check करो!'
              : 'Check your kundli for free too!'}
          </Text>
          <TouchableOpacity style={s.shareCardBtn} onPress={handleShare} activeOpacity={0.7}>
            <Text style={s.shareCardBtnText}>
              📤 {language === 'hi' ? 'Share करें' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(32) }} />
      </ScrollView>

      {/* Toast */}
      {shareToast && (
        <View style={s.toast}>
          <Text style={s.toastText}>Link copied!</Text>
        </View>
      )}
    </View>
  );
}

// ---- Styles ----

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.grey50,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(12),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(10),
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey200,
  },
  backButton: { padding: wp(6) },
  backArrow: { fontSize: fp(20), color: colors.neutral.grey700 },
  topBarTitle: {
    flex: 1,
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.secondary.maroon,
  },
  shareBtn: { padding: wp(6) },
  shareBtnText: { fontSize: fp(18) },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(14),
    paddingTop: hp(14),
  },

  /* Diagnosis Card */
  diagnosisCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    padding: wp(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: hp(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(4),
  },
  cardHeaderIcon: { fontSize: fp(20) },
  cardTitle: {
    fontSize: fp(17),
    fontWeight: '700',
    color: colors.secondary.maroon,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.grey200,
    marginVertical: hp(10),
  },

  /* Section blocks */
  section: { marginBottom: hp(12) },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(4),
  },
  sectionIcon: { fontSize: fp(14) },
  sectionTitle: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey700,
  },
  bold: { fontWeight: '700' },
  rootCauseText: {
    fontSize: fp(14),
    lineHeight: fp(14) * 1.5,
    color: colors.neutral.grey800,
  },
  dashaLabel: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    marginBottom: hp(2),
  },
  dashaText: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  dashaEnd: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    marginTop: hp(1),
  },

  /* Impact list */
  impactList: { gap: hp(4) },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  impactDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.primary.saffron,
  },
  impactText: {
    fontSize: fp(14),
    color: colors.neutral.grey800,
  },

  /* Assessment */
  assessmentGrid: { gap: hp(6) },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentLabel: {
    fontSize: fp(13),
    color: colors.neutral.grey600,
    flex: 1,
  },
  assessmentValue: {
    fontSize: fp(13),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  assessmentPositive: {
    color: colors.semantic.success,
  },

  /* Positive message */
  positiveMsg: {
    backgroundColor: '#F0FFF4',
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.success,
    borderRadius: wp(8),
    padding: wp(12),
    marginTop: hp(4),
  },
  positiveMsgText: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey700,
    fontStyle: 'italic',
  },

  /* Free Remedies Section */
  freeSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(16),
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.success,
    padding: wp(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: hp(14),
  },
  freeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(6),
  },
  freeBadge: { fontSize: fp(16) },
  freeSectionTitle: {
    fontSize: fp(15),
    fontWeight: '700',
    color: colors.semantic.success,
    flex: 1,
  },
  freeSubtitle: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey600,
    marginBottom: hp(12),
  },

  /* Remedy cards */
  remedyCard: {
    backgroundColor: colors.neutral.grey50,
    borderRadius: wp(12),
    borderTopWidth: 2,
    borderTopColor: '#D1FAE5',
    padding: wp(14),
    marginBottom: hp(10),
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(6),
  },
  remedyNumber: {
    fontSize: fp(14),
    fontWeight: '700',
    color: colors.neutral.grey500,
  },
  remedyIcon: { fontSize: fp(16) },
  remedyName: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey800,
    flex: 1,
  },
  mantraBlock: {
    backgroundColor: colors.neutral.cream,
    borderRadius: wp(8),
    padding: wp(10),
    marginBottom: hp(8),
  },
  mantraRoman: {
    fontSize: fp(13),
    fontWeight: '600',
    color: colors.primary.saffronDark,
    fontStyle: 'italic',
    lineHeight: fp(13) * 1.4,
  },
  mantraDevanagari: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.secondary.maroon,
    marginTop: hp(4),
    lineHeight: fp(15) * 1.4,
  },
  remedyDesc: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.4,
    color: colors.neutral.grey700,
    marginBottom: hp(8),
  },
  remedyMeta: {
    flexDirection: 'row',
    gap: wp(16),
    marginBottom: hp(10),
  },
  remedyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  remedyMetaIcon: { fontSize: fp(12) },
  remedyMetaText: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
  },
  remedyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
  },
  listenBtn: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(7),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
    borderRadius: wp(20),
    backgroundColor: colors.neutral.white,
  },
  listenBtnText: {
    fontSize: fp(12),
    color: colors.neutral.grey600,
  },
  trackerBtn: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(7),
    borderWidth: 1.5,
    borderColor: colors.semantic.success,
    borderRadius: wp(20),
    backgroundColor: colors.neutral.white,
  },
  trackerBtnAdded: {
    backgroundColor: colors.semantic.successLight,
    borderColor: colors.semantic.success,
  },
  trackerBtnText: {
    fontSize: fp(12),
    fontWeight: '500',
    color: colors.semantic.success,
  },
  trackerBtnTextAdded: {
    color: '#065F46',
  },
  freeFooter: {
    backgroundColor: '#F0FFF4',
    borderRadius: wp(8),
    padding: wp(10),
    marginTop: hp(4),
  },
  freeFooterText: {
    fontSize: fp(12),
    color: '#065F46',
    lineHeight: fp(12) * 1.5,
  },

  /* Upsell section */
  upsellSection: {
    backgroundColor: colors.neutral.grey100,
    borderRadius: wp(16),
    padding: wp(16),
    marginBottom: hp(14),
  },
  upsellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(6),
  },
  upsellBadge: { fontSize: fp(18) },
  upsellTitle: {
    fontSize: fp(15),
    fontWeight: '700',
    color: colors.neutral.grey800,
  },
  upsellSubtitle: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey600,
    marginBottom: hp(12),
  },
  lockedItem: {
    flexDirection: 'row',
    gap: wp(10),
    marginBottom: hp(10),
  },
  lockedIcon: { fontSize: fp(14), marginTop: hp(2) },
  lockedContent: { flex: 1 },
  lockedName: {
    fontSize: fp(13),
    fontWeight: '600',
    color: colors.neutral.grey800,
    lineHeight: fp(13) * 1.4,
  },
  lockedDesc: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    marginTop: hp(1),
    lineHeight: fp(12) * 1.4,
  },
  socialProof: {
    fontSize: fp(12),
    color: colors.neutral.grey600,
    textAlign: 'center',
    marginVertical: hp(10),
  },
  unlockBtn: {
    backgroundColor: colors.accent.gold,
    borderRadius: wp(14),
    paddingVertical: hp(14),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: hp(8),
  },
  unlockBtnIcon: { fontSize: fp(16) },
  unlockBtnLabel: {
    fontSize: fp(16),
    fontWeight: '700',
    color: colors.neutral.white,
    marginTop: hp(2),
  },
  unlockPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginTop: hp(4),
  },
  unlockPrice: {
    fontSize: fp(18),
    fontWeight: '800',
    color: colors.neutral.white,
  },
  unlockOrigPrice: {
    fontSize: fp(14),
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
  privacyBadge: {
    fontSize: fp(11),
    color: colors.neutral.grey500,
    textAlign: 'center',
  },

  /* AI Follow-Up */
  aiFollowUp: {
    marginBottom: hp(14),
  },
  aiFollowUpRow: {
    flexDirection: 'row',
    gap: wp(8),
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: colors.neutral.cream,
    borderWidth: 1.5,
    borderColor: colors.accent.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: { fontSize: fp(14) },
  aiFollowUpBubble: {
    flex: 1,
    backgroundColor: colors.neutral.cream,
    borderRadius: wp(16),
    borderBottomLeftRadius: wp(4),
    padding: wp(14),
  },
  aiFollowUpText: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey800,
    marginBottom: hp(12),
  },
  ctaPaths: { gap: hp(8) },
  ctaPathBtn: {
    paddingVertical: hp(10),
    paddingHorizontal: wp(14),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
    borderRadius: wp(12),
    backgroundColor: colors.neutral.white,
  },
  ctaPathPrimary: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold,
  },
  ctaPathText: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey700,
    textAlign: 'center',
  },
  ctaPathPrimaryText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },

  /* Share Card */
  shareCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: colors.neutral.grey200,
    padding: wp(14),
    marginBottom: hp(14),
  },
  shareCardText: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.neutral.grey800,
    marginBottom: hp(6),
  },
  shareCardMantra: {
    fontSize: fp(13),
    lineHeight: fp(13) * 1.5,
    color: colors.primary.saffronDark,
    fontStyle: 'italic',
    marginBottom: hp(6),
  },
  shareCardCta: {
    fontSize: fp(13),
    color: colors.neutral.grey600,
    marginBottom: hp(10),
  },
  shareCardBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(20),
  },
  shareCardBtnText: {
    fontSize: fp(13),
    fontWeight: '600',
    color: colors.neutral.white,
  },

  /* Toast */
  toast: {
    position: 'absolute',
    bottom: hp(80),
    alignSelf: 'center',
    backgroundColor: colors.neutral.grey800,
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
    borderRadius: wp(24),
  },
  toastText: {
    fontSize: fp(13),
    color: colors.neutral.white,
  },
});

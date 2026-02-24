'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SeverityLevel, ResponsivenessLevel, FreeRemedy, PaidRemedyPreview } from '@upaya/shared';
import styles from './page.module.css';

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

  // Problem-specific positive messages
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

  // Free remedies per problem type
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
  mantra: '\uD83D\uDCFF', // 📿
  fasting: '\uD83C\uDF7D\uFE0F', // 🍽️
  daan: '\uD83C\uDF81', // 🎁
  daily_practice: '\uD83E\uDDD8', // 🧘
};

const SEVERITY_LABELS: Record<SeverityLevel, Record<string, string>> = {
  significant: { hi: 'Significant', en: 'Significant' },
  moderate: { hi: 'Moderate', en: 'Moderate' },
  mild: { hi: 'Mild', en: 'Mild' },
};

const RESPONSIVENESS_LABELS: Record<ResponsivenessLevel, Record<string, string>> = {
  highly_responsive: { hi: 'Highly responsive', en: 'Highly responsive' },
  responsive: { hi: 'Responsive', en: 'Responsive' },
  moderately_responsive: { hi: 'Moderately responsive', en: 'Moderately responsive' },
};

// ---- Component ----

function DiagnosisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const problemType = searchParams.get('problem') || 'marriage_delay';
  const lang = (searchParams.get('lang') || 'hi') as 'hi' | 'en';
  const dob = searchParams.get('dob') || '';
  const place = searchParams.get('place') || '';

  const [trackerAdded, setTrackerAdded] = useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = useState(false);

  // Load language from localStorage if available
  const [language, setLanguage] = useState<'hi' | 'en'>(lang);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const diagnosis = useMemo(() => generateMockDiagnosis(problemType, language), [problemType, language]);

  const handleAddToTracker = useCallback((remedyId: string) => {
    setTrackerAdded((prev) => {
      const next = new Set(prev);
      next.add(remedyId);
      return next;
    });
  }, []);

  const handleUnlockPlan = useCallback(() => {
    const params = new URLSearchParams({
      problem: problemType,
      lang: language,
      dob,
      place,
    });
    router.push(`/chat/paywall?${params.toString()}`);
  }, [router, problemType, language, dob, place]);

  const handleAskMore = useCallback(() => {
    router.push(`/chat?problem=${problemType}`);
  }, [router, problemType]);

  const handleShare = useCallback(() => {
    const shareText = language === 'hi'
      ? `📊 मेरी कुंडली में ${diagnosis.doshaDisplayName} मिला — ${diagnosis.rootPlanets.join(' + ')} ${diagnosis.affectedHouses.join(', ')}th house में।\n\nयह mantra suggest हुआ:\n"${diagnosis.freeRemedies[0]?.mantraText?.roman || ''}"\n\nअपनी कुंडली भी free में check करो: https://upaya.app`
      : `📊 My kundli shows ${diagnosis.doshaDisplayName} — ${diagnosis.rootPlanets.join(' + ')} in ${diagnosis.affectedHouses.join(', ')}th house.\n\nSuggested mantra:\n"${diagnosis.freeRemedies[0]?.mantraText?.roman || ''}"\n\nCheck your kundli for free: https://upaya.app`;

    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }, [diagnosis, language]);

  const socialProofCount = useMemo(() => {
    return Math.floor(8000 + Math.random() * 8000);
  }, []);

  return (
    <div className={styles.diagnosisLayout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={styles.topBarTitle}>Upaya AI</span>
        <button className={styles.shareButton} onClick={handleShare} aria-label="Share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className={styles.scrollArea}>
        <div className={styles.container}>

          {/* ============================================
             PART 1: Diagnosis Card
             ============================================ */}
          <div className={styles.diagnosisCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>📊</span>
              <h2 className={styles.cardTitle}>
                {language === 'hi' ? 'आपकी कुंडली Diagnosis' : 'YOUR KUNDLI DIAGNOSIS'}
              </h2>
            </div>

            <div className={styles.cardDivider} />

            {/* Root cause */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionIcon}>🔍</span>
                {language === 'hi' ? 'Root Cause Identified' : 'Root Cause Identified'}
              </div>
              <p className={styles.rootCauseText}>
                {diagnosis.rootPlanets.join(` (${language === 'hi' ? 'मंगल' : 'Mars'}) + `
                  .length > 0 ? '' : '')}{diagnosis.rootPlanets.map((p, i) => (
                  <span key={i}>
                    <strong>{p}</strong>
                    {i < diagnosis.rootPlanets.length - 1 ? ' + ' : ''}
                  </span>
                ))}
                {' '}
                {language === 'hi'
                  ? `दोनों आपके ${diagnosis.affectedHouses.join(', ')}th house (${problemType === 'marriage_delay' ? 'marriage house' : problemType === 'career_stuck' ? 'career house' : 'affected house'}) में`
                  : `both in your ${diagnosis.affectedHouses.join(', ')}th house (${problemType === 'marriage_delay' ? 'marriage house' : problemType === 'career_stuck' ? 'career house' : 'affected house'})`}
              </p>
            </div>

            {/* Current Dasha */}
            <div className={styles.sectionBlock}>
              <div className={styles.dashaLabel}>
                {language === 'hi' ? 'Currently running:' : 'Currently running:'}
              </div>
              <p className={styles.dashaText}>
                {diagnosis.currentDasha.main} → {diagnosis.currentDasha.sub}
              </p>
              <p className={styles.dashaEnd}>
                ({language === 'hi' ? 'active until' : 'active until'} {diagnosis.currentDasha.endDate})
              </p>
            </div>

            {/* Impacted areas */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionIcon}>🎯</span>
                {language === 'hi' ? 'Impacted Areas' : 'Impacted Areas'}
              </div>
              <ul className={styles.impactList}>
                <li className={styles.impactItem}>
                  <span className={styles.impactDot} />
                  {diagnosis.primaryImpact}
                </li>
                {diagnosis.secondaryImpacts.map((impact, i) => (
                  <li key={i} className={styles.impactItem}>
                    <span className={styles.impactDot} />
                    {impact}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dosha Assessment */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionIcon}>📋</span>
                {language === 'hi' ? 'Dosha Assessment' : 'Dosha Assessment'}
              </div>
              <div className={styles.assessmentGrid}>
                <div className={styles.assessmentRow}>
                  <span className={styles.assessmentLabel}>
                    {language === 'hi' ? 'Dosha Level:' : 'Dosha Level:'}
                  </span>
                  <span className={styles.assessmentValue}>
                    {SEVERITY_LABELS[diagnosis.severityLevel][language]}
                  </span>
                </div>
                <div className={styles.assessmentRow}>
                  <span className={styles.assessmentLabel}>
                    {language === 'hi' ? 'Commonly addressed?' : 'Commonly addressed?'}
                  </span>
                  <span className={`${styles.assessmentValue} ${styles.assessmentPositive}`}>
                    ✅ {language === 'hi' ? 'YES' : 'YES'}
                  </span>
                </div>
                <div className={styles.assessmentRow}>
                  <span className={styles.assessmentLabel}>
                    {language === 'hi' ? 'Responsive to remedies?' : 'Responsive to remedies?'}
                  </span>
                  <span className={`${styles.assessmentValue} ${styles.assessmentPositive}`}>
                    ✅ {RESPONSIVENESS_LABELS[diagnosis.responsivenessLevel][language]}
                  </span>
                </div>
              </div>
            </div>

            {/* Positive message */}
            <div className={styles.positiveMessage}>
              <p>{diagnosis.positiveMessage}</p>
            </div>
          </div>

          {/* ============================================
             PART 2: Free Remedies
             ============================================ */}
          <div className={styles.freeRemediesSection}>
            <div className={styles.freeRemediesHeader}>
              <span className={styles.freeRemediesBadge}>🟢</span>
              <h2 className={styles.freeRemediesTitle}>
                {language === 'hi'
                  ? 'आज ही अपनी Remedies शुरू करें (FREE)'
                  : 'START YOUR REMEDIES TODAY (FREE)'}
              </h2>
            </div>

            <p className={styles.freeRemediesSubtitle}>
              {language === 'hi'
                ? 'ये remedies आप आज ही शुरू कर सकते हैं — बिल्कुल free। इन्हें शुरू करने से planetary pressure कम होने लगता है।'
                : "These remedies you can start today — completely free. Starting these begins reducing planetary pressure."}
            </p>

            <div className={styles.remedyList}>
              {diagnosis.freeRemedies.map((remedy, index) => {
                const isAdded = trackerAdded.has(remedy.id);
                return (
                  <div key={remedy.id} className={styles.remedyCard}>
                    <div className={styles.remedyHeader}>
                      <span className={styles.remedyNumber}>{index + 1}.</span>
                      <span className={styles.remedyIcon}>{REMEDY_TYPE_ICONS[remedy.type] || '📿'}</span>
                      <h3 className={styles.remedyName}>{remedy.name}</h3>
                    </div>

                    {/* Mantra text */}
                    {remedy.mantraText && (
                      <div className={styles.mantraBlock}>
                        <p className={styles.mantraRoman}>"{remedy.mantraText.roman}"</p>
                        <p className={styles.mantraDevanagari}>{remedy.mantraText.devanagari}</p>
                      </div>
                    )}

                    <p className={styles.remedyDescription}>{remedy.description}</p>

                    <div className={styles.remedyMeta}>
                      <span className={styles.remedyMetaItem}>
                        <span className={styles.remedyMetaIcon}>🔄</span>
                        {remedy.frequency}
                      </span>
                      <span className={styles.remedyMetaItem}>
                        <span className={styles.remedyMetaIcon}>📅</span>
                        {remedy.duration}
                      </span>
                    </div>

                    <div className={styles.remedyActions}>
                      {remedy.mantraText && (
                        <button className={styles.listenButton}>
                          <span>▶️</span>
                          {language === 'hi' ? 'उच्चारण सुनें' : 'Listen to Pronunciation'}
                        </button>
                      )}
                      <button
                        className={`${styles.addTrackerButton} ${isAdded ? styles.addTrackerButtonAdded : ''}`}
                        onClick={() => handleAddToTracker(remedy.id)}
                        disabled={isAdded}
                      >
                        <span>{isAdded ? '✅' : '➕'}</span>
                        {isAdded
                          ? (language === 'hi' ? 'Tracker में Added' : 'Added to Tracker')
                          : (language === 'hi' ? 'Tracker में Add करें' : 'Add to Remedy Tracker')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.freeRemediesFooter}>
              <p>
                {language === 'hi'
                  ? '✅ "यह आपका foundation है। इन्हें आज से शुरू करें — planetary pressure कम होना start होगा।"'
                  : '✅ "This is your foundation. Start these today — planetary pressure will begin to reduce."'}
              </p>
            </div>
          </div>

          {/* ============================================
             PART 3: Complete Plan Upsell (Locked)
             ============================================ */}
          <div className={styles.upsellSection}>
            <div className={styles.upsellHeader}>
              <span className={styles.upsellBadge}>✨</span>
              <h2 className={styles.upsellTitle}>
                {language === 'hi' ? 'COMPLETE OPTIMIZED PLAN' : 'COMPLETE OPTIMIZED PLAN'}
              </h2>
            </div>

            <p className={styles.upsellSubtitle}>
              {language === 'hi'
                ? 'आप free remedies शुरू कर रहे हैं — great start! Complete plan से आपको मिलेगा:'
                : "You're starting free remedies — great start! With the complete plan you'll get:"}
            </p>

            <div className={styles.lockedItemsList}>
              {diagnosis.paidRemedyPreviews.map((item) => (
                <div key={item.id} className={styles.lockedItem}>
                  <span className={styles.lockedIcon}>🔒</span>
                  <div className={styles.lockedContent}>
                    <span className={styles.lockedName}>{item.name}</span>
                    <span className={styles.lockedDesc}>{item.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.socialProof}>
              <span>👥</span>
              {language === 'hi'
                ? `${socialProofCount.toLocaleString()} users with similar charts ने unlock किया`
                : `${socialProofCount.toLocaleString()} users with similar charts unlocked their plan`}
            </div>

            <button className={styles.unlockButton} onClick={handleUnlockPlan}>
              <span className={styles.unlockButtonIcon}>✨</span>
              <span className={styles.unlockButtonText}>
                {language === 'hi' ? 'Complete Plan Unlock करें' : 'Unlock Complete Plan'}
              </span>
              <span className={styles.unlockButtonPrice}>
                <span className={styles.currentPrice}>₹199</span>
                <span className={styles.originalPrice}>₹499</span>
              </span>
            </button>

            <div className={styles.privacyBadge}>
              <span>🔒</span>
              {language === 'hi' ? '100% Private · Encrypted Data' : '100% Private · Encrypted Data'}
            </div>
          </div>

          {/* ============================================
             AI Follow-Up / CTA Paths
             ============================================ */}
          <div className={styles.aiFollowUp}>
            <div className={styles.aiFollowUpBubble}>
              <div className={styles.aiFollowUpAvatar}>🙏</div>
              <div className={styles.aiFollowUpContent}>
                <p>
                  {language === 'hi'
                    ? 'आपका diagnosis clear है। मैंने 3 remedies free में suggest की हैं — आप आज से शुरू कर सकते हैं।\n\nComplete plan में specific temples aur timing भी मिलेगा — जो results को और powerful बनाता है। लेकिन पहले free remedies से start करना भी बहुत अच्छा step है।'
                    : "Your diagnosis is clear. I've suggested 3 free remedies — you can start today.\n\nThe complete plan also includes specific temples and timing — which makes results even more powerful. But starting with free remedies is also a great first step."}
                </p>

                <div className={styles.ctaPaths}>
                  <button className={styles.ctaPathButton} onClick={() => {
                    diagnosis.freeRemedies.forEach(r => handleAddToTracker(r.id));
                  }}>
                    <span>📿</span>
                    {language === 'hi'
                      ? 'Free remedies Tracker में add करें (आज से शुरू)'
                      : 'Add free remedies to my tracker (start today)'}
                  </button>

                  <button className={`${styles.ctaPathButton} ${styles.ctaPathPrimary}`} onClick={handleUnlockPlan}>
                    <span>✨</span>
                    {language === 'hi' ? 'Complete plan unlock करें ₹199' : 'Unlock complete plan ₹199'}
                  </button>

                  <button className={styles.ctaPathButton} onClick={handleAskMore}>
                    <span>💬</span>
                    {language === 'hi' ? 'कुछ और पूछना है' : 'I have more questions'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
             Share Card
             ============================================ */}
          <div className={styles.shareCard}>
            <p className={styles.shareCardText}>
              {language === 'hi'
                ? `📊 मेरी कुंडली में ${diagnosis.doshaDisplayName} मिला — ${diagnosis.rootPlanets.join(' + ')} ${diagnosis.affectedHouses.join(', ')}th house में।`
                : `📊 My kundli shows ${diagnosis.doshaDisplayName} — ${diagnosis.rootPlanets.join(' + ')} in ${diagnosis.affectedHouses.join(', ')}th house.`}
            </p>
            {diagnosis.freeRemedies[0]?.mantraText && (
              <p className={styles.shareCardMantra}>
                {language === 'hi' ? 'यह mantra suggest हुआ:' : 'Suggested mantra:'}
                <br />
                "{diagnosis.freeRemedies[0].mantraText.roman}"
              </p>
            )}
            <p className={styles.shareCardCta}>
              {language === 'hi'
                ? 'अपनी कुंडली भी free में check करो!'
                : 'Check your kundli for free too!'}
            </p>
            <button className={styles.shareCardButton} onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {language === 'hi' ? 'Share करें' : 'Share'}
            </button>
          </div>

        </div>
      </div>

      {/* Toast notification */}
      {shareToast && (
        <div className={styles.toast}>
          {language === 'hi' ? 'Link copied!' : 'Link copied!'}
        </div>
      )}
    </div>
  );
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<div className={styles.diagnosisLayout} />}>
      <DiagnosisContent />
    </Suspense>
  );
}

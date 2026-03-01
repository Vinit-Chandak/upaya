'use client';

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

// ---- Types ----

type ReportTab = 'analysis' | 'remedies' | 'temples' | 'timeline';

interface DoshaCard {
  name: string;
  severity: string;
  severityNum: string;
  color: 'primary' | 'secondary';
  description: string;
  impacts: string[];
  vedicRef?: string;
}

interface PujaRecommendation {
  id: string;
  name: string;
  temple: string;
  city: string;
  reason: string;
  bestDate: string;
  price: number;
}

interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: string;
}

// ---- Mock report data ----

function generateReportData(problemType: string, language: 'hi' | 'en') {
  const isHi = language === 'hi';

  const doshaCards: DoshaCard[] = problemType === 'marriage_delay' ? [
    {
      name: isHi ? 'मंगल दोष (Severe)' : 'Mangal Dosha (Severe)',
      severity: isHi ? 'Severe' : 'Severe',
      severityNum: '8.2/10',
      color: 'primary',
      description: isHi
        ? 'Mars (मंगल) आपके 7th house में है — जो marriage और partnerships का house है। यह एक classic Mangal Dosha configuration है।'
        : 'Mars (Mangal) is placed in your 7th house — the house of marriage and partnerships. This is a classic Mangal Dosha configuration.',
      impacts: isHi
        ? ['शादी की बात अंतिम चरण में टूटना', 'संभावित match के साथ गलतफहमियां', 'अदृश्य बाधाओं का अहसास']
        : ['Repeated breakdowns in marriage talks at final stages', 'Arguments or misunderstandings with potential matches', 'Feeling of invisible obstacles'],
      vedicRef: '"Kuje vyaye cha patale, saptame ashtame tatha..." — Brihat Parashara Hora Shastra',
    },
    {
      name: isHi ? 'शनि Influence (Moderate)' : 'Shani Influence (Moderate)',
      severity: isHi ? 'Moderate' : 'Moderate',
      severityNum: '6.5/10',
      color: 'secondary',
      description: isHi
        ? 'Saturn conjunct Mars delays को amplify करता है। Saturn का nature slow करना है — Mars के साथ 7th house में, यह marriage prospects पर "double lock" बनाता है।'
        : "Saturn conjunct Mars amplifies the delays. Saturn's nature is to slow things down — combined with Mars in 7th, it creates a \"double lock\" on marriage prospects.",
      impacts: [],
    },
  ] : [
    {
      name: isHi ? 'शनि दोष (Significant)' : 'Shani Dosha (Significant)',
      severity: isHi ? 'Significant' : 'Significant',
      severityNum: '7.5/10',
      color: 'primary',
      description: isHi
        ? 'Saturn (शनि) आपके 10th house (career house) को affect कर रहा है। यह professional growth में delays और obstacles create करता है।'
        : 'Saturn is affecting your 10th house (career house). This creates delays and obstacles in professional growth.',
      impacts: isHi
        ? ['Promotions में delay', 'Professional recognition की कमी', 'Effort के अनुपात में results न मिलना']
        : ['Delayed promotions', 'Lack of professional recognition', 'Results not proportional to effort'],
    },
    {
      name: isHi ? 'राहु Influence (Moderate)' : 'Rahu Influence (Moderate)',
      severity: isHi ? 'Moderate' : 'Moderate',
      severityNum: '5.8/10',
      color: 'secondary',
      description: isHi
        ? 'Rahu confusion और unclear thinking create करता है। Career decisions में uncertainty और wrong choices का risk बढ़ जाता है।'
        : 'Rahu creates confusion and unclear thinking. Risk of uncertainty and wrong choices in career decisions increases.',
      impacts: [],
    },
  ];

  const dashaAnalysis = {
    main: isHi ? 'शनि महादशा (2019-2038)' : 'Shani Mahadasha (2019-2038)',
    sub: isHi ? 'राहु अंतर्दशा (2024-2027)' : 'Rahu Antardasha (2024-2027)',
    analysis: isHi
      ? 'यह PEAK difficulty period है। Oct 2027 के बाद, Jupiter Antardasha शुरू होगी — जो significantly ज़्यादा favorable है।'
      : 'This is the PEAK difficulty period. After Oct 2027, Jupiter Antardasha begins — which is significantly more favorable.',
  };

  const freeRemedies = problemType === 'marriage_delay' ? [
    {
      id: 'fr1',
      name: isHi ? 'मंगल मंत्र (Daily)' : 'Mangal Mantra (Daily)',
      type: 'mantra',
      mantraText: { roman: 'Om Kraam Kreem Kraum Sah Bhaumaaya Namah', devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' },
      frequency: isHi ? '108 बार, हर मंगलवार सुबह 10 AM से पहले' : 'Recite 108 times every Tuesday morning before 10 AM',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr2',
      name: isHi ? 'मंगलवार व्रत' : 'Tuesday Fasting',
      type: 'fasting',
      frequency: isHi ? 'हर मंगलवार, सूर्यास्त के बाद खाएं। नमक न खाएं। फल allowed।' : 'Every Tuesday, eat only after sunset. Avoid salt. Fruits allowed.',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr3',
      name: isHi ? 'दान (Donation)' : 'Daan (Donation)',
      type: 'daan',
      frequency: isHi ? 'हर मंगलवार लाल मसूर दाल + लाल कपड़ा मंदिर में दान' : 'Donate red masoor dal + red cloth at temple every Tuesday',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr4',
      name: isHi ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)',
      type: 'daily_practice',
      frequency: isHi ? 'रोज़ सुबह 1 बार पढ़ें। Mars को positively strengthen करता है।' : 'Read once daily in the morning. Strengthens Mars positively.',
      duration: isHi ? '9 हफ़्ते' : '9 weeks',
    },
  ] : [
    {
      id: 'fr1',
      name: isHi ? 'शनि मंत्र (Daily)' : 'Shani Mantra (Daily)',
      type: 'mantra',
      mantraText: { roman: 'Om Praam Preem Praum Sah Shanaischaraaya Namah', devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' },
      frequency: isHi ? '108 बार, हर शनिवार शाम' : '108 times, every Saturday evening',
      duration: isHi ? '11 शनिवार' : '11 Saturdays',
    },
    {
      id: 'fr2',
      name: isHi ? 'शनिवार व्रत' : 'Saturday Fasting',
      type: 'fasting',
      frequency: isHi ? 'हर शनिवार सूर्यास्त तक। काले तिल का दान।' : 'Every Saturday until sunset. Donate black sesame seeds.',
      duration: isHi ? '11 शनिवार' : '11 Saturdays',
    },
    {
      id: 'fr3',
      name: isHi ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)',
      type: 'daily_practice',
      frequency: isHi ? 'रोज़ सुबह 1 बार। Saturn के negative effects balance करता है।' : 'Once daily in the morning. Balances negative effects of Saturn.',
      duration: isHi ? '9 हफ़्ते' : '9 weeks',
    },
  ];

  const pujas: PujaRecommendation[] = problemType === 'marriage_delay' ? [
    {
      id: 'puja1',
      name: isHi ? 'मंगल शांति पूजा' : 'Mangal Shanti Puja',
      temple: isHi ? 'मंगलनाथ मंदिर' : 'Mangalnath Temple',
      city: isHi ? 'उज्जैन (MP)' : 'Ujjain (MP)',
      reason: isHi
        ? 'Mangalnath, Mars का जन्मस्थान है Vedic texts के अनुसार। आपकी chart में Mars 7th house में है — यह इस specific dosha के लिए सबसे powerful temple है।'
        : "Mangalnath is the birthplace of Mars according to Vedic texts. Your chart shows Mars in 7th house — this is the most powerful temple for this specific dosha.",
      bestDate: isHi ? 'अगला मंगलवार (Mangal Hora)' : 'Next Tuesday (Mangal Hora)',
      price: 1100,
    },
    {
      id: 'puja2',
      name: isHi ? 'शनि शांति पूजा' : 'Shani Shanti Puja',
      temple: isHi ? 'शनि देव मंदिर' : 'Shani Dev Temple',
      city: isHi ? 'उज्जैन (MP)' : 'Ujjain (MP)',
      reason: isHi
        ? 'Saturn conjunct Mars को शांत करने के लिए। Shani Hora में किया जाता है।'
        : 'To pacify Saturn conjunct Mars. Performed during Shani Hora.',
      bestDate: isHi ? 'अगला शनिवार (Shani Hora)' : 'Next Saturday (Shani Hora)',
      price: 1500,
    },
    {
      id: 'puja3',
      name: isHi ? 'नवग्रह पूजा' : 'Navagraha Puja',
      temple: isHi ? 'कोई भी नवग्रह मंदिर' : 'Any Navagraha Temple',
      city: '',
      reason: isHi
        ? 'Overall planetary balance के लिए। Annually recommended।'
        : 'For overall planetary balance. Recommended annually.',
      bestDate: isHi ? 'किसी भी शुभ दिन' : 'Any auspicious day',
      price: 2100,
    },
  ] : [
    {
      id: 'puja1',
      name: isHi ? 'शनि शांति पूजा' : 'Shani Shanti Puja',
      temple: isHi ? 'शनि देव मंदिर' : 'Shani Dev Temple',
      city: isHi ? 'शिंगणापुर (MH)' : 'Shingnapur (MH)',
      reason: isHi
        ? 'Career blockage के लिए सबसे effective temple। शनि Hora में पूजा।'
        : 'Most effective temple for career blockage. Puja during Shani Hora.',
      bestDate: isHi ? 'अगला शनिवार' : 'Next Saturday',
      price: 1500,
    },
  ];

  const products: ProductRecommendation[] = problemType === 'marriage_delay' ? [
    {
      id: 'prod1',
      name: isHi ? 'Red Coral (मूंगा) Ring' : 'Red Coral (Moonga) Ring',
      description: isHi
        ? 'Mars को strengthen करता है। अनामिका (ring finger), दाहिने हाथ, मंगलवार को पहनें। Minimum 5 ratti, तांबे या सोने में।'
        : 'Strengthens Mars. Wear on ring finger, right hand, on a Tuesday. Minimum 5 ratti, set in copper or gold.',
      price: 2500,
      badge: isHi ? 'Certified, Pran Pratistha done' : 'Certified, Pran Pratistha done',
    },
    {
      id: 'prod2',
      name: isHi ? 'हनुमान कवच' : 'Hanuman Kavach',
      description: isHi
        ? 'Protective pendant. रोज़ पहनें। Temple blessed।'
        : 'Protective pendant. Wear daily. Temple blessed.',
      price: 599,
      badge: isHi ? 'Temple blessed' : 'Temple blessed',
    },
  ] : [
    {
      id: 'prod1',
      name: isHi ? 'Blue Sapphire (नीलम) Ring' : 'Blue Sapphire (Neelam) Ring',
      description: isHi
        ? 'Saturn को strengthen करता है। Middle finger, शनिवार को पहनें। Expert consultation ज़रूरी।'
        : 'Strengthens Saturn. Wear on middle finger on Saturday. Expert consultation required.',
      price: 3500,
      badge: isHi ? 'Lab certified' : 'Lab certified',
    },
  ];

  const timeline = [
    {
      phase: isHi ? 'Week 1-3: Foundation Phase' : 'Week 1-3: Foundation Phase',
      tasks: isHi
        ? ['मंत्र + व्रत शुरू करें', `${problemType === 'marriage_delay' ? 'मंगल शांति पूजा' : 'शनि शांति पूजा'} book करें`, 'हनुमान चालीसा daily शुरू करें']
        : ['Start mantras + fasting', `Book ${problemType === 'marriage_delay' ? 'Mangal Shanti Puja' : 'Shani Shanti Puja'}`, 'Begin Hanuman Chalisa daily'],
    },
    {
      phase: isHi ? 'Week 4-6: Intensification' : 'Week 4-6: Intensification',
      tasks: isHi
        ? ['मंत्र continue (power build हो रही है)', `${problemType === 'marriage_delay' ? 'शनि शांति पूजा book करें' : 'नवग्रह पूजा book करें'}`, 'Gemstone/product पहनें (if purchased)']
        : ['Continue mantras (power is building)', `Book ${problemType === 'marriage_delay' ? 'Shani Shanti Puja' : 'Navagraha Puja'}`, 'Wear gemstone/product (if purchased)'],
    },
    {
      phase: isHi ? 'Week 7-9: Consolidation' : 'Week 7-9: Consolidation',
      tasks: isHi
        ? ['सभी 9 cycles complete करें', 'नवग्रह पूजा (balance)', 'Full protocol review']
        : ['Complete all 9 cycles', 'Navagraha Puja (balance)', 'Full protocol review'],
    },
  ];

  return { doshaCards, dashaAnalysis, freeRemedies, pujas, products, timeline };
}

// ---- Helpers ----

const REMEDY_TYPE_ICONS: Record<string, string> = {
  mantra: 'mala',
  fasting: 'diya',
  daan: 'gift',
  daily_practice: 'meditation',
};

// ---- Component ----

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const problemType = searchParams.get('problem') || 'marriage_delay';
  const lang = searchParams.get('lang') || 'hi';
  const dob = searchParams.get('dob') || '15/03/1995';
  const place = searchParams.get('place') || 'Lucknow';

  const [language, setLanguage] = useState<'hi' | 'en'>(lang as 'hi' | 'en');
  const [activeTab, setActiveTab] = useState<ReportTab>('analysis');
  const [trackerAdded, setTrackerAdded] = useState<Set<string>>(new Set());
  const [protocolStarted, setProtocolStarted] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const report = useMemo(() => generateReportData(problemType, language), [problemType, language]);

  const handleAddToTracker = useCallback((id: string) => {
    setTrackerAdded((prev) => new Set(prev).add(id));
  }, []);

  const handleStartProtocol = useCallback(() => {
    setProtocolStarted(true);
    report.freeRemedies.forEach((r) => handleAddToTracker(r.id));
  }, [report.freeRemedies, handleAddToTracker]);

  const handleShare = useCallback(() => {
    const shareText = language === 'hi'
      ? 'मेरी कुंडली में दोष मिला — अपनी कुंडली भी free में check करें! https://upaya.app'
      : 'My kundli revealed a dosha — check your kundli for free too! https://upaya.app';
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  }, [language]);

  const isHi = language === 'hi';

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'analysis', label: isHi ? 'Analysis' : 'Analysis' },
    { key: 'remedies', label: isHi ? 'Remedies' : 'Remedies' },
    { key: 'temples', label: isHi ? 'Temples' : 'Temples' },
    { key: 'timeline', label: isHi ? 'Timeline' : 'Timeline' },
  ];

  return (
    <div className={styles.reportLayout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={styles.topBarTitle}>
          {isHi ? 'Report' : 'Report'}
        </span>
        <div className={styles.topBarActions}>
          <button className={styles.iconButton} aria-label="Download PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button className={styles.iconButton} onClick={handleShare} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Report header */}
      <div className={styles.reportHeader}>
        <div className={styles.reportHeaderInner}>
          <span className={styles.reportHeaderIcon}><Icon name="scroll-remedy" size={24} color="var(--color-accent-gold)" /></span>
          <h1 className={styles.reportTitle}>
            {isHi ? 'COMPLETE REMEDY PLAN' : 'COMPLETE REMEDY PLAN'}
          </h1>
          <p className={styles.reportMeta}>
            {isHi ? `DOB: ${dob} · ${place}` : `DOB: ${dob} · ${place}`}
          </p>
          <p className={styles.reportId}>
            Report ID: UP-2026-{Math.floor(Math.random() * 9000 + 1000)}
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className={styles.tabsWrapper} ref={tabsRef}>
        <div className={styles.tabsScroll}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.scrollArea}>
        <div className={styles.container}>

          {/* ============================================
             TAB: Analysis
             ============================================ */}
          {activeTab === 'analysis' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>
                {isHi ? 'DOSHA ANALYSIS' : 'DOSHA ANALYSIS'}
              </h2>

              {/* Kundli chart placeholder */}
              <div className={styles.kundliChartContainer}>
                <div className={styles.kundliChart}>
                  <div className={styles.kundliCenter}>
                    <span>ASC</span>
                  </div>
                  {/* Simplified kundli diamond grid */}
                  <div className={styles.kundliHouse} data-house="1" style={{ top: '0%', left: '25%', width: '50%', height: '25%' }}>
                    <span className={styles.houseNum}>1</span>
                    <span className={styles.housePlanet}><Icon name="sun-full" size={14} color="var(--color-accent-gold)" /></span>
                  </div>
                  <div className={styles.kundliHouse} data-house="2" style={{ top: '0%', left: '75%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>2</span>
                    <span className={styles.housePlanet}>♃</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="3" style={{ top: '25%', left: '75%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>3</span>
                    <span className={styles.housePlanet}>☿</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="4" style={{ top: '25%', left: '25%', width: '50%', height: '25%' }}>
                    <span className={styles.houseNum}>4</span>
                    <span className={styles.housePlanet}><Icon name="moon-crescent" size={14} color="var(--color-accent-gold)" /></span>
                  </div>
                  <div className={styles.kundliHouse} data-house="5" style={{ top: '50%', left: '75%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>5</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="6" style={{ top: '75%', left: '75%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>6</span>
                    <span className={styles.housePlanet}>♀☋</span>
                  </div>
                  <div className={`${styles.kundliHouse} ${styles.problemHouse}`} data-house="7" style={{ top: '50%', left: '25%', width: '50%', height: '25%' }}>
                    <span className={styles.houseNum}>7</span>
                    <span className={styles.housePlanet}>Ma Sa</span>
                    <span className={styles.problemLabel}>{isHi ? 'PROBLEM ZONE' : 'PROBLEM ZONE'}</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="8" style={{ top: '75%', left: '25%', width: '50%', height: '25%' }}>
                    <span className={styles.houseNum}>8</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="9" style={{ top: '75%', left: '0%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>9</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="10" style={{ top: '50%', left: '0%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>10</span>
                    <span className={styles.housePlanet}>☿</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="11" style={{ top: '25%', left: '0%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>11</span>
                  </div>
                  <div className={styles.kundliHouse} data-house="12" style={{ top: '0%', left: '0%', width: '25%', height: '25%' }}>
                    <span className={styles.houseNum}>12</span>
                    <span className={styles.housePlanet}>☊</span>
                  </div>
                </div>
                <p className={styles.chartCaption}>
                  {isHi ? 'Tap any house to see details' : 'Tap any house to see details'}
                </p>
              </div>

              {/* Dosha cards */}
              {report.doshaCards.map((dosha, i) => (
                <div key={i} className={`${styles.doshaCard} ${dosha.color === 'primary' ? styles.doshaCardPrimary : styles.doshaCardSecondary}`}>
                  <div className={styles.doshaCardHeader}>
                    <span className={styles.doshaColorDot} />
                    <h3 className={styles.doshaCardTitle}>{dosha.name}</h3>
                    <span className={styles.doshaSeverity}>{dosha.severityNum}</span>
                  </div>
                  <p className={styles.doshaDescription}>{dosha.description}</p>
                  {dosha.impacts.length > 0 && (
                    <div className={styles.doshaImpacts}>
                      <p className={styles.doshaImpactLabel}>
                        {isHi ? 'Impact on your life:' : 'Impact on your life:'}
                      </p>
                      <ul className={styles.doshaImpactList}>
                        {dosha.impacts.map((impact, j) => (
                          <li key={j}>{impact}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dosha.vedicRef && (
                    <div className={styles.vedicRef}>
                      <p>{isHi ? 'Vedic Reference:' : 'Vedic Reference:'}</p>
                      <p className={styles.vedicRefText}>{dosha.vedicRef}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Dasha analysis */}
              <div className={styles.dashaCard}>
                <h3 className={styles.dashaTitle}>
                  {isHi ? 'Current Dasha Impact' : 'Current Dasha Impact'}
                </h3>
                <p className={styles.dashaMain}>{report.dashaAnalysis.main}</p>
                <p className={styles.dashaSub}>{report.dashaAnalysis.sub}</p>
                <p className={styles.dashaAnalysis}>{report.dashaAnalysis.analysis}</p>
              </div>
            </div>
          )}

          {/* ============================================
             TAB: Remedies
             ============================================ */}
          {activeTab === 'remedies' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>
                {isHi ? 'YOUR REMEDY PLAN (9 weeks)' : 'YOUR REMEDY PLAN (9 weeks)'}
              </h2>

              {/* Free remedies */}
              <div className={styles.remedyCategoryBlock}>
                <h3 className={styles.remedyCategoryTitle}>
                  <span className={styles.remedyCategoryDot} style={{ background: 'var(--color-success)' }} />
                  {isHi ? 'FREE REMEDIES (Start Today)' : 'FREE REMEDIES (Start Today)'}
                </h3>

                {report.freeRemedies.map((remedy, i) => (
                  <div key={remedy.id} className={`${styles.remedyItem} ${styles.remedyItemFree}`}>
                    <div className={styles.remedyItemHeader}>
                      <span className={styles.remedyItemNum}>{i + 1}.</span>
                      <span><Icon name={REMEDY_TYPE_ICONS[remedy.type] || 'mala'} size={16} color="var(--color-accent-gold)" /></span>
                      <span className={styles.remedyItemName}>{remedy.name}</span>
                    </div>
                    {remedy.mantraText && (
                      <div className={styles.remedyMantra}>
                        <p>"{remedy.mantraText.roman}"</p>
                        <p className={styles.devanagari}>{remedy.mantraText.devanagari}</p>
                      </div>
                    )}
                    <p className={styles.remedyItemDetail}>{remedy.frequency}</p>
                    <p className={styles.remedyItemDuration}>
                      {isHi ? 'Duration:' : 'Duration:'} {remedy.duration}
                    </p>
                    <div className={styles.remedyItemActions}>
                      {remedy.mantraText && (
                        <button className={styles.miniButton}>
                          <Icon name="play-video" size={14} color="currentColor" /> {isHi ? 'Listen' : 'Listen'}
                        </button>
                      )}
                      <button
                        className={`${styles.miniButton} ${styles.miniButtonGreen} ${trackerAdded.has(remedy.id) ? styles.miniButtonDone : ''}`}
                        onClick={() => handleAddToTracker(remedy.id)}
                        disabled={trackerAdded.has(remedy.id)}
                      >
                        {trackerAdded.has(remedy.id) ? <><Icon name="sparkles" size={14} color="var(--color-success, #22c55e)" /> Added</> : <><span>+</span> {isHi ? 'Tracker' : 'Tracker'}</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Pujas */}
              <div className={styles.remedyCategoryBlock}>
                <h3 className={styles.remedyCategoryTitle}>
                  <span className={styles.remedyCategoryDot} style={{ background: 'var(--color-warning)' }} />
                  {isHi ? 'RECOMMENDED PUJAS' : 'RECOMMENDED PUJAS'}
                </h3>

                {report.pujas.map((puja) => (
                  <div key={puja.id} className={`${styles.remedyItem} ${styles.remedyItemPuja}`}>
                    <div className={styles.remedyItemHeader}>
                      <span><Icon name="temple-silhouette" size={16} color="var(--color-accent-gold)" /></span>
                      <span className={styles.remedyItemName}>{puja.name}</span>
                    </div>
                    <p className={styles.remedyItemDetail}>
                      {isHi ? 'Best temple:' : 'Best temple:'} {puja.temple}, {puja.city}
                    </p>
                    <p className={styles.remedyItemDetail}>{puja.reason}</p>
                    <p className={styles.remedyItemDetail}>
                      {isHi ? 'Best date:' : 'Best date:'} {puja.bestDate}
                    </p>
                    <button className={styles.bookPujaButton}>
                      <Icon name="temple-silhouette" size={14} color="currentColor" /> {isHi ? 'Book This Puja' : 'Book This Puja'} — ₹{puja.price.toLocaleString()}
                    </button>
                  </div>
                ))}
              </div>

              {/* Recommended Products */}
              <div className={styles.remedyCategoryBlock}>
                <h3 className={styles.remedyCategoryTitle}>
                  <span className={styles.remedyCategoryDot} style={{ background: 'var(--color-info)' }} />
                  {isHi ? 'RECOMMENDED PRODUCTS' : 'RECOMMENDED PRODUCTS'}
                </h3>

                {report.products.map((product) => (
                  <div key={product.id} className={`${styles.remedyItem} ${styles.remedyItemProduct}`}>
                    <div className={styles.remedyItemHeader}>
                      <span><Icon name="gemstone" size={16} color="var(--color-accent-gold)" /></span>
                      <span className={styles.remedyItemName}>{product.name}</span>
                    </div>
                    <p className={styles.remedyItemDetail}>{product.description}</p>
                    <p className={styles.productPrice}>
                      ₹{product.price.toLocaleString()} — {product.badge}
                    </p>
                    <button className={styles.viewStoreButton}>
                      <Icon name="cart" size={14} color="currentColor" /> {isHi ? 'View in Siddha Store' : 'View in Siddha Store'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================
             TAB: Temples
             ============================================ */}
          {activeTab === 'temples' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>
                {isHi ? 'TEMPLE RECOMMENDATIONS' : 'TEMPLE RECOMMENDATIONS'}
              </h2>

              {report.pujas.map((puja) => (
                <div key={puja.id} className={styles.templeCard}>
                  <div className={styles.templeImagePlaceholder}>
                    <span><Icon name="temple-silhouette" size={32} color="var(--color-accent-gold)" /></span>
                  </div>
                  <div className={styles.templeInfo}>
                    <h3 className={styles.templeName}>{puja.name}</h3>
                    <p className={styles.templeLocation}>{puja.temple}{puja.city ? `, ${puja.city}` : ''}</p>

                    <div className={styles.templeReason}>
                      <p className={styles.templeReasonLabel}>
                        {isHi ? 'Why this temple?' : 'Why this temple?'}
                      </p>
                      <p className={styles.templeReasonText}>{puja.reason}</p>
                    </div>

                    <div className={styles.templeInclusions}>
                      <p className={styles.templeInclusionLabel}>
                        {isHi ? "What's included:" : "What's included:"}
                      </p>
                      {[
                        isHi ? 'Full vidhi के साथ पूजा' : 'Puja with full vidhi',
                        isHi ? 'आपका नाम + गोत्र संकल्प में' : 'Your name + gotra in sankalp',
                        isHi ? 'HD Video (3-5 min)' : 'HD video of complete puja (3-5 min)',
                        isHi ? 'Photos' : 'Photos of ritual',
                        isHi ? 'Consecrated प्रसाद (shipped)' : 'Consecrated prasad shipped to you',
                        isHi ? 'Digital completion certificate' : 'Digital completion certificate',
                      ].map((item, i) => (
                        <div key={i} className={styles.templeInclusionItem}>
                          <span><Icon name="sparkles" size={14} color="var(--color-success, #22c55e)" /></span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.templeDelivery}>
                      <span><Icon name="video" size={14} color="currentColor" /> {isHi ? 'Video: 3-5 days' : 'Video: 3-5 days'}</span>
                      <span><Icon name="prasad-box" size={14} color="currentColor" /> {isHi ? 'Prasad: 7-10 days (free shipping)' : 'Prasad: 7-10 days (free shipping)'}</span>
                    </div>

                    <button className={styles.bookPujaButtonLarge}>
                      {isHi ? `Book Puja — ₹${puja.price.toLocaleString()}` : `Book Puja — ₹${puja.price.toLocaleString()}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================
             TAB: Timeline
             ============================================ */}
          {activeTab === 'timeline' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>
                {isHi ? 'YOUR 9-WEEK PROTOCOL' : 'YOUR 9-WEEK PROTOCOL'}
              </h2>

              <div className={styles.timelineList}>
                {report.timeline.map((phase, i) => (
                  <div key={i} className={styles.timelinePhase}>
                    <div className={styles.timelineDot}>
                      <span>{i + 1}</span>
                    </div>
                    <div className={styles.timelineContent}>
                      <h3 className={styles.timelinePhaseTitle}>{phase.phase}</h3>
                      <ul className={styles.timelineTaskList}>
                        {phase.tasks.map((task, j) => (
                          <li key={j} className={styles.timelineTask}>
                            <span className={styles.timelineTaskBullet}>•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                {/* Post-protocol */}
                <div className={styles.timelinePhase}>
                  <div className={`${styles.timelineDot} ${styles.timelineDotFinal}`}>
                    <span>✓</span>
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelinePhaseTitle}>
                      {isHi ? 'After Protocol:' : 'After Protocol:'}
                    </h3>
                    <p className={styles.timelinePostText}>
                      {isHi
                        ? '"Hum aapke saath check-in karenge aur progress dekhenge. Zaroorat ho toh adjust bhi karenge."'
                        : '"We\'ll check in with you to see how things are progressing and adjust if needed."'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <span className={styles.disclaimerIcon}><Icon name="hourglass-clock" size={18} color="currentColor" /></span>
                <p>
                  {isHi
                    ? '"Remedies negative planetary influences ki intensity kam karne ka kaam karti hain. Yeh traditional Vedic practices hain jo faith aur discipline ke saath ki jaati hain. Results individual ke hisaab se vary karte hain. Yeh specific outcomes ki guarantee nahi hai."'
                    : '"Remedies work by reducing the intensity of negative planetary influences. They are traditional Vedic practices performed with faith and discipline. Results vary by individual. This is not a guarantee of specific outcomes."'}
                </p>
              </div>
            </div>
          )}

          {/* ============================================
             Actions (always visible)
             ============================================ */}
          <div className={styles.actionsSection}>
            <button
              className={`${styles.startProtocolButton} ${protocolStarted ? styles.startProtocolButtonDone : ''}`}
              onClick={handleStartProtocol}
              disabled={protocolStarted}
            >
              {protocolStarted ? (
                <><Icon name="sparkles" size={16} color="var(--color-success, #22c55e)" /> {isHi ? 'Protocol Started!' : 'Protocol Started!'}</>
              ) : (
                <><Icon name="mala" size={16} color="currentColor" /> {isHi ? 'Start My 9-Week Protocol' : 'Start My 9-Week Protocol'}</>
              )}
              {!protocolStarted && (
                <span className={styles.startProtocolSub}>
                  {isHi ? '(Add all remedies to tracker)' : '(Add all remedies to tracker)'}
                </span>
              )}
            </button>

            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {isHi ? 'Download PDF' : 'Download PDF'}
              </button>
              <button className={styles.actionButton} onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {isHi ? 'Share' : 'Share with Family'}
              </button>
            </div>

            <button className={styles.askAiButton} onClick={() => router.push(`/chat?problem=${problemType}`)}>
              <Icon name="chat-bubble" size={16} color="currentColor" /> {isHi ? 'Ask AI about this report' : 'Ask AI about this report'}
            </button>
          </div>

          {/* Share card */}
          <div className={styles.shareCard}>
            <p className={styles.shareCardText}>
              {isHi
                ? 'मेरी कुंडली में दोष मिला — अपनी कुंडली भी free में check करें!'
                : 'My kundli revealed a dosha — check your kundli for free too!'}
            </p>
            <button className={styles.shareCardButton} onClick={handleShare}>
              <Icon name="share" size={14} color="currentColor" /> {isHi ? 'Share करें' : 'Share'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className={styles.reportLayout} />}>
      <ReportContent />
    </Suspense>
  );
}

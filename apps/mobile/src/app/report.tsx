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
import { colors } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      severity: 'Severe',
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
      severity: 'Moderate',
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
      severity: 'Significant',
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
      severity: 'Moderate',
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
      id: 'fr1', name: isHi ? 'मंगल मंत्र (Daily)' : 'Mangal Mantra (Daily)', type: 'mantra',
      mantraText: { roman: 'Om Kraam Kreem Kraum Sah Bhaumaaya Namah', devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः' },
      frequency: isHi ? '108 बार, हर मंगलवार सुबह 10 AM से पहले' : 'Recite 108 times every Tuesday morning before 10 AM',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr2', name: isHi ? 'मंगलवार व्रत' : 'Tuesday Fasting', type: 'fasting',
      frequency: isHi ? 'हर मंगलवार, सूर्यास्त के बाद खाएं। नमक न खाएं।' : 'Every Tuesday, eat only after sunset. Avoid salt.',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr3', name: isHi ? 'दान (Donation)' : 'Daan (Donation)', type: 'daan',
      frequency: isHi ? 'हर मंगलवार लाल मसूर दाल + लाल कपड़ा मंदिर में दान' : 'Donate red masoor dal + red cloth at temple every Tuesday',
      duration: isHi ? '9 मंगलवार' : '9 Tuesdays',
    },
    {
      id: 'fr4', name: isHi ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)', type: 'daily_practice',
      frequency: isHi ? 'रोज़ सुबह 1 बार पढ़ें' : 'Read once daily in the morning',
      duration: isHi ? '9 हफ़्ते' : '9 weeks',
    },
  ] : [
    {
      id: 'fr1', name: isHi ? 'शनि मंत्र (Daily)' : 'Shani Mantra (Daily)', type: 'mantra',
      mantraText: { roman: 'Om Praam Preem Praum Sah Shanaischaraaya Namah', devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः' },
      frequency: isHi ? '108 बार, हर शनिवार शाम' : '108 times, every Saturday evening',
      duration: isHi ? '11 शनिवार' : '11 Saturdays',
    },
    {
      id: 'fr2', name: isHi ? 'शनिवार व्रत' : 'Saturday Fasting', type: 'fasting',
      frequency: isHi ? 'हर शनिवार सूर्यास्त तक। काले तिल का दान।' : 'Every Saturday until sunset. Donate black sesame seeds.',
      duration: isHi ? '11 शनिवार' : '11 Saturdays',
    },
    {
      id: 'fr3', name: isHi ? 'हनुमान चालीसा (Daily)' : 'Hanuman Chalisa (Daily)', type: 'daily_practice',
      frequency: isHi ? 'रोज़ सुबह 1 बार' : 'Once daily in the morning',
      duration: isHi ? '9 हफ़्ते' : '9 weeks',
    },
  ];

  const pujas: PujaRecommendation[] = problemType === 'marriage_delay' ? [
    {
      id: 'puja1', name: isHi ? 'मंगल शांति पूजा' : 'Mangal Shanti Puja',
      temple: isHi ? 'मंगलनाथ मंदिर' : 'Mangalnath Temple', city: isHi ? 'उज्जैन (MP)' : 'Ujjain (MP)',
      reason: isHi
        ? 'Mangalnath, Mars का जन्मस्थान है। Mars 7th house में है — यह सबसे powerful temple है।'
        : "Mangalnath is the birthplace of Mars. Mars in 7th house — this is the most powerful temple.",
      bestDate: isHi ? 'अगला मंगलवार (Mangal Hora)' : 'Next Tuesday (Mangal Hora)', price: 1100,
    },
    {
      id: 'puja2', name: isHi ? 'शनि शांति पूजा' : 'Shani Shanti Puja',
      temple: isHi ? 'शनि देव मंदिर' : 'Shani Dev Temple', city: isHi ? 'उज्जैन (MP)' : 'Ujjain (MP)',
      reason: isHi
        ? 'Saturn conjunct Mars को शांत करने के लिए।'
        : 'To pacify Saturn conjunct Mars.',
      bestDate: isHi ? 'अगला शनिवार (Shani Hora)' : 'Next Saturday (Shani Hora)', price: 1500,
    },
  ] : [
    {
      id: 'puja1', name: isHi ? 'शनि शांति पूजा' : 'Shani Shanti Puja',
      temple: isHi ? 'शनि देव मंदिर' : 'Shani Dev Temple', city: isHi ? 'शिंगणापुर (MH)' : 'Shingnapur (MH)',
      reason: isHi
        ? 'Career blockage के लिए सबसे effective temple।'
        : 'Most effective temple for career blockage.',
      bestDate: isHi ? 'अगला शनिवार' : 'Next Saturday', price: 1500,
    },
  ];

  const products: ProductRecommendation[] = problemType === 'marriage_delay' ? [
    {
      id: 'prod1', name: isHi ? 'Red Coral (मूंगा) Ring' : 'Red Coral (Moonga) Ring',
      description: isHi
        ? 'Mars को strengthen करता है। अनामिका, दाहिने हाथ, मंगलवार को पहनें।'
        : 'Strengthens Mars. Wear on ring finger, right hand, on Tuesday.',
      price: 2500, badge: isHi ? 'Certified, Pran Pratistha done' : 'Certified, Pran Pratistha done',
    },
    {
      id: 'prod2', name: isHi ? 'हनुमान कवच' : 'Hanuman Kavach',
      description: isHi ? 'Protective pendant. रोज़ पहनें। Temple blessed।' : 'Protective pendant. Wear daily. Temple blessed.',
      price: 599, badge: 'Temple blessed',
    },
  ] : [
    {
      id: 'prod1', name: isHi ? 'Blue Sapphire (नीलम) Ring' : 'Blue Sapphire (Neelam) Ring',
      description: isHi
        ? 'Saturn को strengthen करता है। Middle finger, शनिवार को पहनें।'
        : 'Strengthens Saturn. Wear on middle finger on Saturday.',
      price: 3500, badge: 'Lab certified',
    },
  ];

  const timeline = [
    {
      phase: isHi ? 'Week 1-3: Foundation' : 'Week 1-3: Foundation',
      tasks: isHi
        ? ['मंत्र + व्रत शुरू करें', `${problemType === 'marriage_delay' ? 'मंगल शांति पूजा' : 'शनि शांति पूजा'} book करें`, 'हनुमान चालीसा daily शुरू करें']
        : ['Start mantras + fasting', `Book ${problemType === 'marriage_delay' ? 'Mangal Shanti Puja' : 'Shani Shanti Puja'}`, 'Begin Hanuman Chalisa daily'],
    },
    {
      phase: isHi ? 'Week 4-6: Intensification' : 'Week 4-6: Intensification',
      tasks: isHi
        ? ['मंत्र continue', `${problemType === 'marriage_delay' ? 'शनि शांति पूजा' : 'नवग्रह पूजा'} book करें`, 'Gemstone/product पहनें']
        : ['Continue mantras (power is building)', `Book ${problemType === 'marriage_delay' ? 'Shani Shanti Puja' : 'Navagraha Puja'}`, 'Wear gemstone (if purchased)'],
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
  mantra: '\uD83D\uDCFF', fasting: '\uD83C\uDF7D\uFE0F',
  daan: '\uD83C\uDF81', daily_practice: '\uD83E\uDDD8',
};

// ---- Component ----

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    problem?: string; lang?: string; dob?: string; place?: string;
  }>();

  const problemType = params.problem || 'marriage_delay';
  const dob = params.dob || '15/03/1995';
  const place = params.place || 'Lucknow';

  const [language, setLanguage] = useState<'hi' | 'en'>((params.lang as 'hi' | 'en') || 'hi');
  const [activeTab, setActiveTab] = useState<ReportTab>('analysis');
  const [trackerAdded, setTrackerAdded] = useState<Set<string>>(new Set());
  const [protocolStarted, setProtocolStarted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('upaya_language');
        if (stored === 'hi' || stored === 'en') setLanguage(stored);
      } catch { /* default */ }
    };
    load();
  }, []);

  const report = useMemo(() => generateReportData(problemType, language), [problemType, language]);
  const isHi = language === 'hi';
  const reportId = useMemo(() => `UP-2026-${Math.floor(Math.random() * 9000 + 1000)}`, []);

  const handleAddToTracker = useCallback((id: string) => {
    setTrackerAdded((prev) => new Set(prev).add(id));
  }, []);

  const handleStartProtocol = useCallback(() => {
    setProtocolStarted(true);
    report.freeRemedies.forEach((r) => handleAddToTracker(r.id));
  }, [report.freeRemedies, handleAddToTracker]);

  const handleShare = useCallback(async () => {
    const shareText = isHi
      ? 'मेरी कुंडली में दोष मिला — अपनी कुंडली भी free में check करें! https://upaya.app'
      : 'My kundli revealed a dosha — check your kundli for free too! https://upaya.app';
    try { await Share.share({ message: shareText }); } catch { /* cancelled */ }
  }, [isHi]);

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'analysis', label: 'Analysis' },
    { key: 'remedies', label: 'Remedies' },
    { key: 'temples', label: 'Temples' },
    { key: 'timeline', label: 'Timeline' },
  ];

  return (
    <View style={st.container}>
      {/* Top bar */}
      <View style={st.topBar}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
          <Text style={st.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={st.topBarTitle}>{isHi ? 'Report' : 'Report'}</Text>
        <TouchableOpacity style={st.iconBtn} onPress={handleShare}>
          <Text style={st.iconBtnText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Report header */}
      <View style={st.reportHeader}>
        <Text style={st.reportHeaderIcon}>📜</Text>
        <Text style={st.reportTitle}>COMPLETE REMEDY PLAN</Text>
        <Text style={st.reportMeta}>DOB: {dob} · {place}</Text>
        <Text style={st.reportId}>Report ID: {reportId}</Text>
      </View>

      {/* Tabs */}
      <View style={st.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.tabsScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[st.tab, activeTab === tab.key && st.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[st.tabText, activeTab === tab.key && st.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable content */}
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ===== ANALYSIS TAB ===== */}
        {activeTab === 'analysis' && (
          <>
            <Text style={st.sectionTitle}>DOSHA ANALYSIS</Text>

            {/* Kundli chart placeholder */}
            <View style={st.kundliChart}>
              <View style={st.kundliGrid}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => (
                  <View key={h} style={[st.kundliHouse, h === (problemType === 'marriage_delay' ? 7 : 10) && st.kundliProblemHouse]}>
                    <Text style={st.houseNum}>{h}</Text>
                    {h === 1 && <Text style={st.housePlanet}>☀️</Text>}
                    {h === 2 && <Text style={st.housePlanet}>♃</Text>}
                    {h === 4 && <Text style={st.housePlanet}>🌙</Text>}
                    {h === 7 && <Text style={st.housePlanet}>♂️♄</Text>}
                    {h === 6 && <Text style={st.housePlanet}>♀☋</Text>}
                    {h === 12 && <Text style={st.housePlanet}>☊</Text>}
                    {h === (problemType === 'marriage_delay' ? 7 : 10) && (
                      <Text style={st.problemLabel}>PROBLEM</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Dosha cards */}
            {report.doshaCards.map((dosha, i) => (
              <View key={i} style={[st.doshaCard, dosha.color === 'primary' ? st.doshaCardPrimary : st.doshaCardSecondary]}>
                <View style={st.doshaCardHeader}>
                  <View style={[st.doshaColorDot, dosha.color === 'primary' ? st.doshaColorPrimary : st.doshaColorSecondary]} />
                  <Text style={st.doshaCardTitle}>{dosha.name}</Text>
                  <Text style={st.doshaSeverity}>{dosha.severityNum}</Text>
                </View>
                <Text style={st.doshaDesc}>{dosha.description}</Text>
                {dosha.impacts.length > 0 && (
                  <View style={st.doshaImpacts}>
                    <Text style={st.doshaImpactLabel}>Impact on your life:</Text>
                    {dosha.impacts.map((impact, j) => (
                      <View key={j} style={st.doshaImpactRow}>
                        <Text style={st.doshaImpactBullet}>•</Text>
                        <Text style={st.doshaImpactText}>{impact}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {dosha.vedicRef && (
                  <View style={st.vedicRef}>
                    <Text style={st.vedicRefLabel}>Vedic Reference:</Text>
                    <Text style={st.vedicRefText}>{dosha.vedicRef}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Dasha analysis */}
            <View style={st.dashaCard}>
              <Text style={st.dashaTitle}>Current Dasha Impact</Text>
              <Text style={st.dashaMain}>{report.dashaAnalysis.main}</Text>
              <Text style={st.dashaSub}>{report.dashaAnalysis.sub}</Text>
              <Text style={st.dashaAnalysis}>{report.dashaAnalysis.analysis}</Text>
            </View>
          </>
        )}

        {/* ===== REMEDIES TAB ===== */}
        {activeTab === 'remedies' && (
          <>
            <Text style={st.sectionTitle}>{isHi ? 'YOUR REMEDY PLAN (9 weeks)' : 'YOUR REMEDY PLAN (9 weeks)'}</Text>

            {/* Free remedies */}
            <View style={st.remedyCategory}>
              <View style={st.remedyCatHeader}>
                <View style={[st.remedyCatDot, { backgroundColor: colors.semantic.success }]} />
                <Text style={st.remedyCatTitle}>{isHi ? 'FREE REMEDIES (Start Today)' : 'FREE REMEDIES (Start Today)'}</Text>
              </View>
              {report.freeRemedies.map((remedy, i) => {
                const added = trackerAdded.has(remedy.id);
                return (
                  <View key={remedy.id} style={st.remedyItem}>
                    <View style={st.remedyItemHeader}>
                      <Text style={st.remedyItemNum}>{i + 1}.</Text>
                      <Text style={st.remedyItemIcon}>{REMEDY_TYPE_ICONS[remedy.type] || '📿'}</Text>
                      <Text style={st.remedyItemName}>{remedy.name}</Text>
                    </View>
                    {remedy.mantraText && (
                      <View style={st.mantraBlock}>
                        <Text style={st.mantraRoman}>"{remedy.mantraText.roman}"</Text>
                        <Text style={st.mantraDevanagari}>{remedy.mantraText.devanagari}</Text>
                      </View>
                    )}
                    <Text style={st.remedyItemDetail}>{remedy.frequency}</Text>
                    <Text style={st.remedyItemDuration}>Duration: {remedy.duration}</Text>
                    <View style={st.remedyItemActions}>
                      {remedy.mantraText && (
                        <TouchableOpacity style={st.miniBtn} activeOpacity={0.7}>
                          <Text style={st.miniBtnText}>▶️ Listen</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[st.miniBtn, st.miniBtnGreen, added && st.miniBtnDone]}
                        onPress={() => handleAddToTracker(remedy.id)}
                        disabled={added}
                        activeOpacity={0.7}
                      >
                        <Text style={[st.miniBtnText, st.miniBtnGreenText]}>
                          {added ? '✅ Added' : '➕ Tracker'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Pujas */}
            <View style={st.remedyCategory}>
              <View style={st.remedyCatHeader}>
                <View style={[st.remedyCatDot, { backgroundColor: colors.semantic.warning }]} />
                <Text style={st.remedyCatTitle}>RECOMMENDED PUJAS</Text>
              </View>
              {report.pujas.map((puja) => (
                <View key={puja.id} style={st.pujaItem}>
                  <View style={st.remedyItemHeader}>
                    <Text style={st.remedyItemIcon}>🛕</Text>
                    <Text style={st.remedyItemName}>{puja.name}</Text>
                  </View>
                  <Text style={st.remedyItemDetail}>{puja.temple}, {puja.city}</Text>
                  <Text style={st.remedyItemDetail}>{puja.reason}</Text>
                  <Text style={st.remedyItemDetail}>Best date: {puja.bestDate}</Text>
                  <TouchableOpacity style={st.bookPujaBtn} activeOpacity={0.8}>
                    <Text style={st.bookPujaBtnText}>
                      🛕 Book This Puja — ₹{puja.price.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Products */}
            <View style={st.remedyCategory}>
              <View style={st.remedyCatHeader}>
                <View style={[st.remedyCatDot, { backgroundColor: colors.semantic.info }]} />
                <Text style={st.remedyCatTitle}>RECOMMENDED PRODUCTS</Text>
              </View>
              {report.products.map((product) => (
                <View key={product.id} style={st.productItem}>
                  <View style={st.remedyItemHeader}>
                    <Text style={st.remedyItemIcon}>💎</Text>
                    <Text style={st.remedyItemName}>{product.name}</Text>
                  </View>
                  <Text style={st.remedyItemDetail}>{product.description}</Text>
                  <Text style={st.productPrice}>₹{product.price.toLocaleString()} — {product.badge}</Text>
                  <TouchableOpacity style={st.storeBtn} activeOpacity={0.8}>
                    <Text style={st.storeBtnText}>🛒 View in Siddha Store</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ===== TEMPLES TAB ===== */}
        {activeTab === 'temples' && (
          <>
            <Text style={st.sectionTitle}>TEMPLE RECOMMENDATIONS</Text>
            {report.pujas.map((puja) => (
              <View key={puja.id} style={st.templeCard}>
                <View style={st.templeImagePlaceholder}>
                  <Text style={st.templeEmoji}>🛕</Text>
                </View>
                <Text style={st.templeName}>{puja.name}</Text>
                <Text style={st.templeLocation}>{puja.temple}{puja.city ? `, ${puja.city}` : ''}</Text>

                <View style={st.templeReason}>
                  <Text style={st.templeReasonLabel}>Why this temple?</Text>
                  <Text style={st.templeReasonText}>{puja.reason}</Text>
                </View>

                <View style={st.templeInclusions}>
                  <Text style={st.templeIncLabel}>What's included:</Text>
                  {[
                    isHi ? 'Full vidhi के साथ पूजा' : 'Puja with full vidhi',
                    isHi ? 'आपका नाम + गोत्र संकल्प में' : 'Your name + gotra in sankalp',
                    isHi ? 'HD Video (3-5 min)' : 'HD video of puja (3-5 min)',
                    isHi ? 'Consecrated प्रसाद (shipped)' : 'Consecrated prasad shipped',
                    isHi ? 'Digital completion certificate' : 'Digital certificate',
                  ].map((item, i) => (
                    <View key={i} style={st.templeIncItem}>
                      <Text style={st.templeIncCheck}>✅</Text>
                      <Text style={st.templeIncText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={st.templeDelivery}>
                  <Text style={st.templeDeliveryText}>📹 Video: 3-5 days</Text>
                  <Text style={st.templeDeliveryText}>📦 Prasad: 7-10 days (free shipping)</Text>
                </View>

                <TouchableOpacity style={st.bookPujaBtnLarge} activeOpacity={0.8}>
                  <Text style={st.bookPujaBtnLargeText}>
                    Book Puja — ₹{puja.price.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ===== TIMELINE TAB ===== */}
        {activeTab === 'timeline' && (
          <>
            <Text style={st.sectionTitle}>{isHi ? 'YOUR 9-WEEK PROTOCOL' : 'YOUR 9-WEEK PROTOCOL'}</Text>

            {report.timeline.map((phase, i) => (
              <View key={i} style={st.timelinePhase}>
                <View style={st.timelineDotCol}>
                  <View style={st.timelineDot}>
                    <Text style={st.timelineDotText}>{i + 1}</Text>
                  </View>
                  {i < report.timeline.length - 1 && <View style={st.timelineLine} />}
                </View>
                <View style={st.timelineContent}>
                  <Text style={st.timelinePhaseTitle}>{phase.phase}</Text>
                  {phase.tasks.map((task, j) => (
                    <View key={j} style={st.timelineTask}>
                      <Text style={st.timelineTaskBullet}>•</Text>
                      <Text style={st.timelineTaskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Post-protocol */}
            <View style={st.timelinePhase}>
              <View style={st.timelineDotCol}>
                <View style={[st.timelineDot, st.timelineDotFinal]}>
                  <Text style={[st.timelineDotText, st.timelineDotTextFinal]}>✓</Text>
                </View>
              </View>
              <View style={st.timelineContent}>
                <Text style={st.timelinePhaseTitle}>After Protocol:</Text>
                <Text style={st.timelinePostText}>
                  {isHi
                    ? '"Hum aapke saath check-in karenge aur progress dekhenge."'
                    : '"We\'ll check in to see how things are progressing and adjust if needed."'}
                </Text>
              </View>
            </View>

            {/* Disclaimer */}
            <View style={st.disclaimer}>
              <Text style={st.disclaimerIcon}>⏳</Text>
              <Text style={st.disclaimerText}>
                {isHi
                  ? '"Remedies negative planetary influences ki intensity kam karne ka kaam karti hain. Results individual ke hisaab se vary karte hain."'
                  : '"Remedies reduce the intensity of negative planetary influences. Results vary by individual."'}
              </Text>
            </View>
          </>
        )}

        {/* ===== Actions (always visible) ===== */}
        <View style={st.actionsSection}>
          <TouchableOpacity
            style={[st.startProtocolBtn, protocolStarted && st.startProtocolBtnDone]}
            onPress={handleStartProtocol}
            disabled={protocolStarted}
            activeOpacity={0.8}
          >
            <Text style={st.startProtocolBtnText}>
              {protocolStarted
                ? `✅ ${isHi ? 'Protocol Started!' : 'Protocol Started!'}`
                : `📿 ${isHi ? 'Start My 9-Week Protocol' : 'Start My 9-Week Protocol'}`}
            </Text>
            {!protocolStarted && (
              <Text style={st.startProtocolBtnSub}>
                {isHi ? '(Add all remedies to tracker)' : '(Add all remedies to tracker)'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={st.actionBtnRow}>
            <TouchableOpacity style={st.actionBtn} activeOpacity={0.7}>
              <Text style={st.actionBtnText}>📥 Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={handleShare} activeOpacity={0.7}>
              <Text style={st.actionBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={st.askAiBtn}
            onPress={() => router.push({ pathname: '/chat', params: { problem: problemType } })}
            activeOpacity={0.7}
          >
            <Text style={st.askAiBtnText}>
              💬 {isHi ? 'Ask AI about this report' : 'Ask AI about this report'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share card */}
        <View style={st.shareCard}>
          <Text style={st.shareCardText}>
            {isHi
              ? 'मेरी कुंडली में दोष मिला — अपनी कुंडली भी free में check करें!'
              : 'My kundli revealed a dosha — check your kundli for free too!'}
          </Text>
          <TouchableOpacity style={st.shareCardBtn} onPress={handleShare} activeOpacity={0.7}>
            <Text style={st.shareCardBtnText}>📤 {isHi ? 'Share करें' : 'Share'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(32) }} />
      </ScrollView>
    </View>
  );
}

// ---- Styles ----

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.grey50 },

  /* Top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    paddingHorizontal: wp(12),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(10),
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey200,
  },
  backBtn: { padding: wp(6) },
  backArrow: { fontSize: fp(20), color: colors.neutral.grey700 },
  topBarTitle: { flex: 1, fontSize: fp(16), fontWeight: '600', color: colors.secondary.maroon },
  iconBtn: { padding: wp(6) },
  iconBtnText: { fontSize: fp(18) },

  /* Report header */
  reportHeader: {
    backgroundColor: colors.secondary.maroon,
    paddingVertical: hp(16), paddingHorizontal: wp(16),
    alignItems: 'center',
  },
  reportHeaderIcon: { fontSize: fp(28), marginBottom: hp(4) },
  reportTitle: { fontSize: fp(18), fontWeight: '800', color: colors.neutral.white, letterSpacing: 1 },
  reportMeta: { fontSize: fp(13), color: 'rgba(255,255,255,0.8)', marginTop: hp(4) },
  reportId: { fontSize: fp(11), color: 'rgba(255,255,255,0.6)', marginTop: hp(2) },

  /* Tabs */
  tabsWrapper: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey200,
  },
  tabsScroll: {
    flexDirection: 'row', paddingHorizontal: wp(12), gap: wp(4),
    paddingVertical: hp(8),
  },
  tab: {
    paddingHorizontal: wp(16), paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.neutral.grey100,
  },
  tabActive: {
    backgroundColor: colors.primary.saffron,
  },
  tabText: { fontSize: fp(13), fontWeight: '500', color: colors.neutral.grey600 },
  tabTextActive: { color: colors.neutral.white, fontWeight: '600' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(14), paddingTop: hp(14) },

  /* Section title */
  sectionTitle: {
    fontSize: fp(15), fontWeight: '700', color: colors.neutral.grey800,
    letterSpacing: 0.5, marginBottom: hp(12),
  },

  /* Kundli chart */
  kundliChart: {
    backgroundColor: colors.neutral.white,
    borderRadius: wp(12), padding: wp(12),
    marginBottom: hp(14),
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  kundliGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  kundliHouse: {
    width: (SCREEN_WIDTH - wp(28) - wp(24)) / 4,
    height: hp(60),
    borderWidth: 0.5, borderColor: colors.neutral.grey200,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutral.grey50,
  },
  kundliProblemHouse: {
    backgroundColor: 'rgba(255,140,0,0.1)',
    borderColor: colors.primary.saffron,
    borderWidth: 1.5,
  },
  houseNum: { fontSize: fp(10), color: colors.neutral.grey400, position: 'absolute', top: hp(2), left: wp(4) },
  housePlanet: { fontSize: fp(14) },
  problemLabel: { fontSize: fp(8), color: colors.primary.saffron, fontWeight: '700', position: 'absolute', bottom: hp(2) },

  /* Dosha cards */
  doshaCard: {
    borderRadius: wp(12), padding: wp(14), marginBottom: hp(12),
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  doshaCardPrimary: {
    backgroundColor: colors.neutral.white,
    borderLeftWidth: 3, borderLeftColor: colors.primary.saffron,
  },
  doshaCardSecondary: {
    backgroundColor: colors.neutral.white,
    borderLeftWidth: 3, borderLeftColor: colors.secondary.maroon,
  },
  doshaCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: hp(6),
  },
  doshaColorDot: { width: wp(8), height: wp(8), borderRadius: wp(4) },
  doshaColorPrimary: { backgroundColor: colors.primary.saffron },
  doshaColorSecondary: { backgroundColor: colors.secondary.maroon },
  doshaCardTitle: { fontSize: fp(15), fontWeight: '700', color: colors.neutral.grey800, flex: 1 },
  doshaSeverity: { fontSize: fp(13), fontWeight: '600', color: colors.primary.saffron },
  doshaDesc: { fontSize: fp(13), lineHeight: fp(13) * 1.5, color: colors.neutral.grey700 },
  doshaImpacts: { marginTop: hp(8) },
  doshaImpactLabel: { fontSize: fp(12), fontWeight: '600', color: colors.neutral.grey600, marginBottom: hp(4) },
  doshaImpactRow: { flexDirection: 'row', gap: wp(6), marginBottom: hp(2) },
  doshaImpactBullet: { fontSize: fp(12), color: colors.primary.saffron },
  doshaImpactText: { fontSize: fp(12), color: colors.neutral.grey700, flex: 1, lineHeight: fp(12) * 1.4 },
  vedicRef: {
    marginTop: hp(8), backgroundColor: colors.neutral.cream,
    borderRadius: wp(8), padding: wp(10),
  },
  vedicRefLabel: { fontSize: fp(11), fontWeight: '600', color: colors.neutral.grey500, marginBottom: hp(2) },
  vedicRefText: { fontSize: fp(12), fontStyle: 'italic', color: colors.secondary.maroon, lineHeight: fp(12) * 1.4 },

  /* Dasha card */
  dashaCard: {
    backgroundColor: colors.neutral.white, borderRadius: wp(12),
    padding: wp(14), marginBottom: hp(14),
    borderTopWidth: 2, borderTopColor: colors.accent.gold,
  },
  dashaTitle: { fontSize: fp(14), fontWeight: '700', color: colors.neutral.grey800, marginBottom: hp(6) },
  dashaMain: { fontSize: fp(14), fontWeight: '600', color: colors.neutral.grey800 },
  dashaSub: { fontSize: fp(13), color: colors.neutral.grey600, marginBottom: hp(6) },
  dashaAnalysis: { fontSize: fp(13), lineHeight: fp(13) * 1.5, color: colors.neutral.grey700, fontStyle: 'italic' },

  /* Remedy categories */
  remedyCategory: { marginBottom: hp(16) },
  remedyCatHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: hp(10) },
  remedyCatDot: { width: wp(8), height: wp(8), borderRadius: wp(4) },
  remedyCatTitle: { fontSize: fp(14), fontWeight: '700', color: colors.neutral.grey800 },

  /* Remedy items */
  remedyItem: {
    backgroundColor: colors.neutral.white, borderRadius: wp(12),
    padding: wp(14), marginBottom: hp(10),
    borderLeftWidth: 3, borderLeftColor: colors.semantic.success,
  },
  remedyItemHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: hp(6) },
  remedyItemNum: { fontSize: fp(13), fontWeight: '700', color: colors.neutral.grey500 },
  remedyItemIcon: { fontSize: fp(14) },
  remedyItemName: { fontSize: fp(14), fontWeight: '600', color: colors.neutral.grey800, flex: 1 },
  mantraBlock: {
    backgroundColor: colors.neutral.cream, borderRadius: wp(8), padding: wp(10), marginBottom: hp(6),
  },
  mantraRoman: { fontSize: fp(13), fontWeight: '600', color: colors.primary.saffronDark, fontStyle: 'italic' },
  mantraDevanagari: { fontSize: fp(15), fontWeight: '600', color: colors.secondary.maroon, marginTop: hp(4) },
  remedyItemDetail: { fontSize: fp(12), color: colors.neutral.grey600, lineHeight: fp(12) * 1.4, marginBottom: hp(2) },
  remedyItemDuration: { fontSize: fp(12), fontWeight: '500', color: colors.neutral.grey500, marginBottom: hp(6) },
  remedyItemActions: { flexDirection: 'row', gap: wp(8), marginTop: hp(4) },
  miniBtn: {
    paddingHorizontal: wp(12), paddingVertical: hp(6),
    borderWidth: 1.5, borderColor: colors.neutral.grey300, borderRadius: wp(20),
    backgroundColor: colors.neutral.white,
  },
  miniBtnText: { fontSize: fp(12), color: colors.neutral.grey600 },
  miniBtnGreen: { borderColor: colors.semantic.success },
  miniBtnGreenText: { color: colors.semantic.success },
  miniBtnDone: { backgroundColor: colors.semantic.successLight },

  /* Puja items */
  pujaItem: {
    backgroundColor: colors.neutral.white, borderRadius: wp(12),
    padding: wp(14), marginBottom: hp(10),
    borderLeftWidth: 3, borderLeftColor: colors.semantic.warning,
  },
  bookPujaBtn: {
    backgroundColor: colors.primary.saffron, borderRadius: wp(10),
    paddingVertical: hp(10), alignItems: 'center', marginTop: hp(8),
  },
  bookPujaBtnText: { fontSize: fp(13), fontWeight: '600', color: colors.neutral.white },

  /* Product items */
  productItem: {
    backgroundColor: colors.neutral.white, borderRadius: wp(12),
    padding: wp(14), marginBottom: hp(10),
    borderLeftWidth: 3, borderLeftColor: colors.semantic.info,
  },
  productPrice: { fontSize: fp(13), fontWeight: '600', color: colors.accent.gold, marginBottom: hp(6) },
  storeBtn: {
    backgroundColor: colors.neutral.grey100, borderRadius: wp(10),
    paddingVertical: hp(10), alignItems: 'center', marginTop: hp(4),
  },
  storeBtnText: { fontSize: fp(13), fontWeight: '500', color: colors.neutral.grey700 },

  /* Temple cards */
  templeCard: {
    backgroundColor: colors.neutral.white, borderRadius: wp(16),
    padding: wp(16), marginBottom: hp(14),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  templeImagePlaceholder: {
    height: hp(100), backgroundColor: colors.neutral.cream,
    borderRadius: wp(12), alignItems: 'center', justifyContent: 'center', marginBottom: hp(10),
  },
  templeEmoji: { fontSize: fp(36) },
  templeName: { fontSize: fp(16), fontWeight: '700', color: colors.neutral.grey800, marginBottom: hp(2) },
  templeLocation: { fontSize: fp(13), color: colors.neutral.grey500, marginBottom: hp(10) },
  templeReason: { marginBottom: hp(10) },
  templeReasonLabel: { fontSize: fp(13), fontWeight: '600', color: colors.neutral.grey700, marginBottom: hp(2) },
  templeReasonText: { fontSize: fp(13), lineHeight: fp(13) * 1.5, color: colors.neutral.grey600 },
  templeInclusions: { marginBottom: hp(10) },
  templeIncLabel: { fontSize: fp(13), fontWeight: '600', color: colors.neutral.grey700, marginBottom: hp(6) },
  templeIncItem: { flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: hp(4) },
  templeIncCheck: { fontSize: fp(12) },
  templeIncText: { fontSize: fp(13), color: colors.neutral.grey600, flex: 1 },
  templeDelivery: { gap: hp(4), marginBottom: hp(12) },
  templeDeliveryText: { fontSize: fp(12), color: colors.neutral.grey500 },
  bookPujaBtnLarge: {
    backgroundColor: colors.accent.gold, borderRadius: wp(14),
    paddingVertical: hp(14), alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  bookPujaBtnLargeText: { fontSize: fp(16), fontWeight: '700', color: colors.neutral.white },

  /* Timeline */
  timelinePhase: { flexDirection: 'row', marginBottom: hp(8) },
  timelineDotCol: { alignItems: 'center', width: wp(36) },
  timelineDot: {
    width: wp(28), height: wp(28), borderRadius: wp(14),
    backgroundColor: colors.primary.saffron, alignItems: 'center', justifyContent: 'center',
  },
  timelineDotText: { fontSize: fp(13), fontWeight: '700', color: colors.neutral.white },
  timelineDotFinal: { backgroundColor: colors.semantic.success },
  timelineDotTextFinal: { fontSize: fp(12) },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.neutral.grey200, marginVertical: hp(4) },
  timelineContent: {
    flex: 1, backgroundColor: colors.neutral.white, borderRadius: wp(12),
    padding: wp(14), marginLeft: wp(8), marginBottom: hp(6),
  },
  timelinePhaseTitle: { fontSize: fp(14), fontWeight: '600', color: colors.neutral.grey800, marginBottom: hp(6) },
  timelineTask: { flexDirection: 'row', gap: wp(6), marginBottom: hp(3) },
  timelineTaskBullet: { fontSize: fp(13), color: colors.primary.saffron },
  timelineTaskText: { fontSize: fp(13), color: colors.neutral.grey700, flex: 1, lineHeight: fp(13) * 1.4 },
  timelinePostText: {
    fontSize: fp(13), fontStyle: 'italic', color: colors.neutral.grey600, lineHeight: fp(13) * 1.5,
  },

  /* Disclaimer */
  disclaimer: {
    flexDirection: 'row', gap: wp(10),
    backgroundColor: colors.neutral.grey100, borderRadius: wp(12), padding: wp(14), marginTop: hp(8),
  },
  disclaimerIcon: { fontSize: fp(16) },
  disclaimerText: { fontSize: fp(12), fontStyle: 'italic', color: colors.neutral.grey500, lineHeight: fp(12) * 1.5, flex: 1 },

  /* Actions section */
  actionsSection: { marginTop: hp(14) },
  startProtocolBtn: {
    backgroundColor: colors.primary.saffron, borderRadius: wp(14),
    paddingVertical: hp(14), alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  startProtocolBtnDone: { backgroundColor: colors.semantic.success },
  startProtocolBtnText: { fontSize: fp(16), fontWeight: '700', color: colors.neutral.white },
  startProtocolBtnSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.8)', marginTop: hp(2) },
  actionBtnRow: { flexDirection: 'row', gap: wp(10), marginTop: hp(10) },
  actionBtn: {
    flex: 1, paddingVertical: hp(12), borderWidth: 1.5, borderColor: colors.neutral.grey200,
    borderRadius: wp(12), alignItems: 'center', backgroundColor: colors.neutral.white,
  },
  actionBtnText: { fontSize: fp(13), fontWeight: '500', color: colors.neutral.grey700 },
  askAiBtn: {
    marginTop: hp(10), paddingVertical: hp(12),
    borderWidth: 1.5, borderColor: colors.primary.saffronLight,
    borderRadius: wp(12), alignItems: 'center', backgroundColor: colors.neutral.cream,
  },
  askAiBtnText: { fontSize: fp(14), fontWeight: '500', color: colors.primary.saffronDark },

  /* Share card */
  shareCard: {
    backgroundColor: colors.neutral.white, borderRadius: wp(12),
    borderWidth: 1, borderColor: colors.neutral.grey200,
    padding: wp(14), marginTop: hp(14), alignItems: 'center',
  },
  shareCardText: { fontSize: fp(13), color: colors.neutral.grey700, textAlign: 'center', marginBottom: hp(10), lineHeight: fp(13) * 1.5 },
  shareCardBtn: {
    paddingHorizontal: wp(20), paddingVertical: hp(8),
    backgroundColor: colors.primary.saffron, borderRadius: wp(20),
  },
  shareCardBtnText: { fontSize: fp(13), fontWeight: '600', color: colors.neutral.white },
});

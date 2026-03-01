'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

const CATEGORIES = [
  { key: 'marriage', iconName: 'marriage', hi: 'विवाह', en: 'Marriage' },
  { key: 'business', iconName: 'briefcase', hi: 'व्यापार', en: 'Business' },
  { key: 'property', iconName: 'house', hi: 'संपत्ति', en: 'Property' },
  { key: 'travel', iconName: 'airplane', hi: 'यात्रा', en: 'Travel' },
  { key: 'education', iconName: 'book-open', hi: 'शिक्षा', en: 'Education' },
  { key: 'ceremony', iconName: 'diya', hi: 'अनुष्ठान', en: 'Ceremony' },
  { key: 'other', iconName: 'calendar', hi: 'अन्य', en: 'Other' },
];

interface MuhurtaResult {
  id: string;
  date: string;
  quality: 'excellent' | 'good' | 'average';
  qualityHi: string;
  qualityEn: string;
  tithi: string;
  nakshatra: string;
  reasonHi: string;
  reasonEn: string;
}

const MOCK_RESULTS: MuhurtaResult[] = [
  {
    id: 'r1',
    date: '2026-03-15',
    quality: 'excellent',
    qualityHi: 'उत्कृष्ट',
    qualityEn: 'Excellent',
    tithi: 'शुक्ल पक्ष दशमी',
    nakshatra: 'रोहिणी',
    reasonHi: 'गुरु बृहस्पति का शुभ दृष्टि, रोहिणी नक्षत्र विवाह के लिए सर्वश्रेष्ठ',
    reasonEn: 'Auspicious aspect of Jupiter, Rohini nakshatra is best for marriage',
  },
  {
    id: 'r2',
    date: '2026-03-22',
    quality: 'good',
    qualityHi: 'अच्छा',
    qualityEn: 'Good',
    tithi: 'शुक्ल पक्ष द्वितीया',
    nakshatra: 'मृगशिरा',
    reasonHi: 'शुक्र बलवान, चन्द्रमा शुभ स्थिति में',
    reasonEn: 'Venus is strong, Moon in an auspicious position',
  },
  {
    id: 'r3',
    date: '2026-04-02',
    quality: 'excellent',
    qualityHi: 'उत्कृष्ट',
    qualityEn: 'Excellent',
    tithi: 'शुक्ल पक्ष सप्तमी',
    nakshatra: 'उत्तरा फाल्गुनी',
    reasonHi: 'सर्वार्थ सिद्धि योग, सभी ग्रह अनुकूल',
    reasonEn: 'Sarvartha Siddhi Yoga, all planets favorable',
  },
  {
    id: 'r4',
    date: '2026-04-10',
    quality: 'average',
    qualityHi: 'सामान्य',
    qualityEn: 'Average',
    tithi: 'शुक्ल पक्ष पूर्णिमा',
    nakshatra: 'हस्त',
    reasonHi: 'पूर्णिमा तिथि, लेकिन मंगल की कुछ बाधा',
    reasonEn: 'Full moon, but some Mars obstruction',
  },
  {
    id: 'r5',
    date: '2026-04-18',
    quality: 'good',
    qualityHi: 'अच्छा',
    qualityEn: 'Good',
    tithi: 'शुक्ल पक्ष नवमी',
    nakshatra: 'अनुराधा',
    reasonHi: 'शनि-गुरु का शुभ योग, स्थायित्व प्रदान करता है',
    reasonEn: 'Auspicious Saturn-Jupiter conjunction, provides stability',
  },
];

interface PreviousQuery {
  id: string;
  queryHi: string;
  queryEn: string;
  category: string;
  date: string;
}

const MOCK_QUERIES: PreviousQuery[] = [
  {
    id: 'q1',
    queryHi: 'बेटी की शादी के लिए शुभ मुहूर्त',
    queryEn: 'Auspicious date for daughter\'s wedding',
    category: 'marriage',
    date: '2026-02-18',
  },
  {
    id: 'q2',
    queryHi: 'नया ऑफिस खोलने का शुभ दिन',
    queryEn: 'Good day to open new office',
    category: 'business',
    date: '2026-02-10',
  },
];

export default function MuhurtaPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleFindMuhurta = () => {
    if (!query.trim() && !selectedCategory) return;
    setShowResults(true);
  };

  const getQualityClass = (quality: string) => {
    switch (quality) {
      case 'excellent': return styles.qualityExcellent;
      case 'good': return styles.qualityGood;
      case 'average': return styles.qualityAverage;
      default: return '';
    }
  };

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'मुहूर्त प्लानर' : 'Muhurta Planner'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>
              {language === 'hi' ? 'शुभ मुहूर्त जानें' : 'Find Auspicious Dates'}
            </h1>
            <p className={styles.headerSub}>
              {language === 'hi'
                ? 'किसी भी शुभ कार्य के लिए सबसे अच्छा मुहूर्त पाएं'
                : 'Get the best muhurta for any auspicious event'}
            </p>
          </div>

          {/* Query Input */}
          <section className={styles.querySection}>
            <textarea
              className={styles.queryInput}
              placeholder={
                language === 'hi'
                  ? 'अपना प्रश्न लिखें... जैसे "बेटी की शादी के लिए मार्च-अप्रैल 2026 में शुभ मुहूर्त बताएं"'
                  : 'Write your query... e.g. "Find auspicious dates for daughter\'s wedding in March-April 2026"'
              }
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </section>

          {/* Category Chips */}
          <section className={styles.categorySection}>
            <div className={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`${styles.categoryChip} ${selectedCategory === cat.key ? styles.categoryChipActive : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                >
                  <Icon name={cat.iconName} size={16} color="var(--color-accent-gold)" />
                  <span className={styles.chipText}>
                    {language === 'hi' ? cat.hi : cat.en}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Find CTA */}
          <button
            className={styles.findCta}
            onClick={handleFindMuhurta}
            disabled={!query.trim() && !selectedCategory}
          >
            {language === 'hi'
              ? 'शुभ मुहूर्त खोजें — \u20B9199'
              : 'Find Auspicious Date — \u20B9199'}
          </button>

          {/* Results Section */}
          {showResults && (
            <section className={styles.resultsSection}>
              <h2 className={styles.sectionTitle}>
                {language === 'hi' ? 'अनुशंसित तिथियां' : 'Recommended Dates'}
              </h2>
              <div className={styles.resultsGrid}>
                {MOCK_RESULTS.map((result) => (
                  <div key={result.id} className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultDate}>{result.date}</span>
                      <span className={`${styles.qualityBadge} ${getQualityClass(result.quality)}`}>
                        {language === 'hi' ? result.qualityHi : result.qualityEn}
                      </span>
                    </div>
                    <div className={styles.resultDetails}>
                      <div className={styles.resultMeta}>
                        <span className={styles.resultMetaLabel}>
                          {language === 'hi' ? 'तिथि:' : 'Tithi:'}
                        </span>
                        <span className={styles.resultMetaValue}>{result.tithi}</span>
                      </div>
                      <div className={styles.resultMeta}>
                        <span className={styles.resultMetaLabel}>
                          {language === 'hi' ? 'नक्षत्र:' : 'Nakshatra:'}
                        </span>
                        <span className={styles.resultMetaValue}>{result.nakshatra}</span>
                      </div>
                    </div>
                    <p className={styles.resultReasoning}>
                      {language === 'hi' ? result.reasonHi : result.reasonEn}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Previous Queries */}
          <section className={styles.previousSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'मेरी मुहूर्त क्वेरीज़' : 'My Muhurta Queries'}
            </h2>
            <div className={styles.previousList}>
              {MOCK_QUERIES.map((q) => (
                <div key={q.id} className={styles.previousCard}>
                  <div className={styles.previousCardLeft}>
                    <span className={styles.previousEmoji}>
                      <Icon name={CATEGORIES.find((c) => c.key === q.category)?.iconName || 'calendar'} size={20} color="var(--color-accent-gold)" />
                    </span>
                    <div className={styles.previousInfo}>
                      <span className={styles.previousQuery}>
                        {language === 'hi' ? q.queryHi : q.queryEn}
                      </span>
                      <span className={styles.previousDate}>{q.date}</span>
                    </div>
                  </div>
                  <button className={styles.previousViewBtn}>
                    {language === 'hi' ? 'देखें \u2192' : 'View \u2192'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Premium Note */}
          <div className={styles.premiumNote}>
            <Icon name="sparkles" size={20} color="var(--color-accent-gold)" />
            <p className={styles.premiumText}>
              {language === 'hi'
                ? 'असीमित मुहूर्त Premium सब्सक्रिप्शन में शामिल है'
                : 'Unlimited muhurta included in Premium subscription'}
            </p>
          </div>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

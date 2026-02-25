'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

type TabKey = 'chart' | 'planets' | 'dashas' | 'yogas';

interface PlanetRow {
  planet: string;
  planetEn: string;
  symbol: string;
  sign: string;
  signEn: string;
  house: number;
  status: 'strong' | 'neutral' | 'weak' | 'afflicted';
}

interface DashaPeriod {
  planet: string;
  planetEn: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
}

interface Yoga {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  type: 'benefic' | 'malefic' | 'mixed';
}

const TABS: { key: TabKey; labelHi: string; labelEn: string }[] = [
  { key: 'chart', labelHi: 'Chart', labelEn: 'Chart' },
  { key: 'planets', labelHi: 'Planets', labelEn: 'Planets' },
  { key: 'dashas', labelHi: 'Dashas', labelEn: 'Dashas' },
  { key: 'yogas', labelHi: 'Yogas', labelEn: 'Yogas' },
];

const MOCK_PLANETS: PlanetRow[] = [
  { planet: '\u0938\u0942\u0930\u094D\u092F', planetEn: 'Sun', symbol: '\u2609', sign: '\u092E\u0947\u0937', signEn: 'Aries', house: 1, status: 'strong' },
  { planet: '\u091A\u0902\u0926\u094D\u0930', planetEn: 'Moon', symbol: '\u263D', sign: '\u0935\u0943\u0937\u092D', signEn: 'Taurus', house: 2, status: 'strong' },
  { planet: '\u092E\u0902\u0917\u0932', planetEn: 'Mars', symbol: '\u2642', sign: '\u092E\u0915\u0930', signEn: 'Capricorn', house: 10, status: 'neutral' },
  { planet: '\u092C\u0941\u0927', planetEn: 'Mercury', symbol: '\u263F', sign: '\u092E\u0940\u0928', signEn: 'Pisces', house: 12, status: 'weak' },
  { planet: '\u0917\u0941\u0930\u0941', planetEn: 'Jupiter', symbol: '\u2643', sign: '\u0927\u0928\u0941', signEn: 'Sagittarius', house: 9, status: 'strong' },
  { planet: '\u0936\u0941\u0915\u094D\u0930', planetEn: 'Venus', symbol: '\u2640', sign: '\u0924\u0941\u0932\u093E', signEn: 'Libra', house: 7, status: 'neutral' },
  { planet: '\u0936\u0928\u093F', planetEn: 'Saturn', symbol: '\u2644', sign: '\u0915\u0941\u0902\u092D', signEn: 'Aquarius', house: 11, status: 'afflicted' },
  { planet: '\u0930\u093E\u0939\u0941', planetEn: 'Rahu', symbol: '\u260A', sign: '\u092E\u093F\u0925\u0941\u0928', signEn: 'Gemini', house: 3, status: 'afflicted' },
  { planet: '\u0915\u0947\u0924\u0941', planetEn: 'Ketu', symbol: '\u260B', sign: '\u0927\u0928\u0941', signEn: 'Sagittarius', house: 9, status: 'weak' },
];

const MOCK_DASHAS: DashaPeriod[] = [
  { planet: '\u0936\u0941\u0915\u094D\u0930', planetEn: 'Venus', startYear: 2005, endYear: 2025, isCurrent: false },
  { planet: '\u0938\u0942\u0930\u094D\u092F', planetEn: 'Sun', startYear: 2025, endYear: 2031, isCurrent: true },
  { planet: '\u091A\u0902\u0926\u094D\u0930', planetEn: 'Moon', startYear: 2031, endYear: 2041, isCurrent: false },
  { planet: '\u092E\u0902\u0917\u0932', planetEn: 'Mars', startYear: 2041, endYear: 2048, isCurrent: false },
  { planet: '\u0930\u093E\u0939\u0941', planetEn: 'Rahu', startYear: 2048, endYear: 2066, isCurrent: false },
];

const MOCK_YOGAS: Yoga[] = [
  {
    name: '\u0917\u091C\u0915\u0947\u0938\u0930\u0940 \u092F\u094B\u0917',
    nameEn: 'Gajakesari Yoga',
    description: '\u091A\u0902\u0926\u094D\u0930 \u0914\u0930 \u0917\u0941\u0930\u0941 \u0915\u0947 \u0938\u0902\u092F\u094B\u0917 \u0938\u0947 \u092C\u0941\u0926\u094D\u0927\u093F, \u0927\u0928 \u0914\u0930 \u092E\u093E\u0928-\u0938\u092E\u094D\u092E\u093E\u0928 \u092E\u093F\u0932\u0924\u093E \u0939\u0948',
    descriptionEn: 'Moon-Jupiter conjunction brings wisdom, wealth, and recognition',
    type: 'benefic',
  },
  {
    name: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937',
    nameEn: 'Mangal Dosha',
    description: '\u092E\u0902\u0917\u0932 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u0935\u093F\u0935\u093E\u0939 \u092E\u0947\u0902 \u0926\u0947\u0930\u0940 \u0915\u093E \u0915\u093E\u0930\u0923 \u0939\u094B \u0938\u0915\u0924\u0940 \u0939\u0948',
    descriptionEn: 'Mars placement may cause marriage delays — remedies available',
    type: 'malefic',
  },
  {
    name: '\u092C\u0941\u0927\u093E\u0926\u093F\u0924\u094D\u092F \u092F\u094B\u0917',
    nameEn: 'Budhaditya Yoga',
    description: '\u0938\u0942\u0930\u094D\u092F \u0914\u0930 \u092C\u0941\u0927 \u0915\u093E \u0938\u0902\u092F\u094B\u0917 \u2014 \u0924\u0940\u0915\u094D\u0937\u094D\u0923 \u092C\u0941\u0926\u094D\u0927\u093F \u0914\u0930 \u0935\u093F\u0926\u094D\u092F\u093E \u092E\u0947\u0902 \u0938\u092B\u0932\u0924\u093E',
    descriptionEn: 'Sun-Mercury conjunction brings sharp intellect and academic success',
    type: 'benefic',
  },
  {
    name: '\u0936\u0928\u093F \u0938\u093E\u0922\u093C\u0947\u0938\u093E\u0924\u0940',
    nameEn: 'Shani Sade Sati',
    description: '\u0936\u0928\u093F \u0915\u0940 \u0938\u093E\u0922\u093C\u0947\u0938\u093E\u0924\u0940 \u091A\u0932 \u0930\u0939\u0940 \u0939\u0948 \u2014 \u0927\u0948\u0930\u094D\u092F \u0914\u0930 \u092E\u0947\u0939\u0928\u0924 \u091C\u093C\u0930\u0942\u0930\u0940',
    descriptionEn: 'Saturn Sade Sati is active — patience and perseverance needed',
    type: 'mixed',
  },
];

const HOUSE_NUMBERS = [12, 1, 2, 3, 11, '', '', 4, 10, '', '', 5, 9, 8, 7, 6];

function getStatusLabel(status: PlanetRow['status'], language: 'hi' | 'en'): string {
  switch (status) {
    case 'strong': return language === 'hi' ? 'Strong' : 'Strong';
    case 'neutral': return language === 'hi' ? 'Neutral' : 'Neutral';
    case 'weak': return language === 'hi' ? 'Weak' : 'Weak';
    case 'afflicted': return language === 'hi' ? 'Afflicted' : 'Afflicted';
  }
}

export default function KundliViewPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<TabKey>('planets');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const handleShare = useCallback(() => {
    const shareText = language === 'hi'
      ? 'Upaya \u092A\u0930 \u092E\u0947\u0930\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u0926\u0947\u0916\u0947\u0902! https://upaya.app'
      : 'Check out my kundli on Upaya! https://upaya.app';
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  }, [language]);

  const renderChart = () => (
    <div className={styles.chartContainer}>
      <div className={styles.chartGrid}>
        {HOUSE_NUMBERS.map((num, idx) => (
          <div
            key={idx}
            className={`${styles.chartCell} ${num === '' ? styles.chartCellCenter : ''}`}
          >
            {num !== '' && <span className={styles.chartHouseNumber}>{num}</span>}
          </div>
        ))}
      </div>
      <p className={styles.chartCaption}>
        {language === 'hi' ? 'D1 \u2014 Birth Chart (Lagna)' : 'D1 \u2014 Birth Chart (Lagna)'}
      </p>
    </div>
  );

  const renderPlanets = () => (
    <div className={styles.tableWrapper}>
      <table className={styles.planetsTable}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>
              {language === 'hi' ? 'Planet' : 'Planet'}
            </th>
            <th className={styles.tableHeader}>
              {language === 'hi' ? 'Sign' : 'Sign'}
            </th>
            <th className={styles.tableHeader}>
              {language === 'hi' ? 'House' : 'House'}
            </th>
            <th className={styles.tableHeader}>
              {language === 'hi' ? 'Status' : 'Status'}
            </th>
          </tr>
        </thead>
        <tbody>
          {MOCK_PLANETS.map((p) => (
            <tr key={p.planetEn} className={styles.tableRow}>
              <td className={styles.tableCell}>
                <span className={styles.planetSymbol}>{p.symbol}</span>
                <span className={styles.planetName}>
                  {language === 'hi' ? p.planet : p.planetEn}
                </span>
              </td>
              <td className={styles.tableCell}>
                {language === 'hi' ? p.sign : p.signEn}
              </td>
              <td className={styles.tableCellCenter}>{p.house}</td>
              <td className={styles.tableCell}>
                <span className={`${styles.statusBadge} ${styles[`status_${p.status}`]}`}>
                  {getStatusLabel(p.status, language)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.hintText}>
        {language === 'hi'
          ? 'Tap any planet for detailed analysis'
          : 'Tap any planet for detailed analysis'}
      </p>
    </div>
  );

  const renderDashas = () => {
    const currentYear = 2026;
    return (
      <div className={styles.dashaContainer}>
        <div className={styles.dashaCurrentCard}>
          <div className={styles.dashaCurrentHeader}>
            <span className={styles.dashaCurrentIcon}>{'\u2728'}</span>
            <h3 className={styles.dashaCurrentTitle}>
              {language === 'hi' ? 'Current Dasha' : 'Current Dasha'}
            </h3>
          </div>
          {MOCK_DASHAS.filter((d) => d.isCurrent).map((d) => (
            <div key={d.planetEn} className={styles.dashaCurrentBody}>
              <p className={styles.dashaCurrentPlanet}>
                {language === 'hi' ? d.planet : d.planetEn} Mahadasha
              </p>
              <p className={styles.dashaCurrentPeriod}>
                {d.startYear} &ndash; {d.endYear}
              </p>
              <div className={styles.dashaProgress}>
                <div
                  className={styles.dashaProgressFill}
                  style={{
                    width: `${Math.min(100, Math.max(0, ((currentYear - d.startYear) / (d.endYear - d.startYear)) * 100))}%`,
                  }}
                />
              </div>
              <p className={styles.dashaProgressLabel}>
                Year {currentYear - d.startYear} of {d.endYear - d.startYear}
              </p>
            </div>
          ))}
        </div>

        <h4 className={styles.dashaUpcomingTitle}>
          {language === 'hi' ? 'Upcoming Periods' : 'Upcoming Periods'}
        </h4>
        <div className={styles.dashaTimeline}>
          {MOCK_DASHAS.map((d) => (
            <div
              key={d.planetEn}
              className={`${styles.dashaItem} ${d.isCurrent ? styles.dashaItemCurrent : ''}`}
            >
              <div className={styles.dashaTimelineDot} />
              <div className={styles.dashaItemContent}>
                <span className={styles.dashaItemPlanet}>
                  {language === 'hi' ? d.planet : d.planetEn}
                </span>
                <span className={styles.dashaItemPeriod}>
                  {d.startYear} &ndash; {d.endYear}
                </span>
              </div>
              {d.isCurrent && (
                <span className={styles.dashaItemBadge}>
                  {language === 'hi' ? 'Active' : 'Active'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderYogas = () => (
    <div className={styles.yogaContainer}>
      {MOCK_YOGAS.map((y, idx) => (
        <div key={idx} className={styles.yogaCard}>
          <div className={styles.yogaCardHeader}>
            <span className={`${styles.yogaTypeDot} ${styles[`yogaType_${y.type}`]}`} />
            <h4 className={styles.yogaName}>
              {language === 'hi' ? y.name : y.nameEn}
            </h4>
            <span className={`${styles.yogaTypeBadge} ${styles[`yogaTypeBadge_${y.type}`]}`}>
              {y.type === 'benefic'
                ? (language === 'hi' ? 'Benefic' : 'Benefic')
                : y.type === 'malefic'
                  ? (language === 'hi' ? 'Malefic' : 'Malefic')
                  : (language === 'hi' ? 'Mixed' : 'Mixed')}
            </span>
          </div>
          <p className={styles.yogaDescription}>
            {language === 'hi' ? y.description : y.descriptionEn}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={language === 'hi' ? 'Full Kundli' : 'Full Kundli'} />

      <main className={styles.mainContent}>
        {/* Share button row */}
        <div className={styles.shareRow}>
          <button className={styles.shareButton} onClick={handleShare} aria-label="Share Kundli">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{language === 'hi' ? 'Share' : 'Share'}</span>
          </button>
        </div>

        <div className={styles.container}>
          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {language === 'hi' ? tab.labelHi : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'chart' && renderChart()}
            {activeTab === 'planets' && renderPlanets()}
            {activeTab === 'dashas' && renderDashas()}
            {activeTab === 'yogas' && renderYogas()}
          </div>
        </div>
      </main>
    </div>
  );
}

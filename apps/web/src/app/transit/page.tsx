'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface TransitAlert {
  id: string;
  planet: string;
  planetHi: string;
  fromSign: string;
  toSign: string;
  fromSignHi: string;
  toSignHi: string;
  impactLevel: 'high' | 'medium' | 'low';
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  affectedAreas: string[];
  affectedAreasHi: string[];
  transitDate: string;
  isRead: boolean;
  remedies: TransitRemedy[];
}

interface TransitRemedy {
  type: 'mantra' | 'puja' | 'practice';
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  isFree: boolean;
  price?: number;
}

const IMPACT_COLORS: Record<string, string> = {
  high: 'var(--color-error)',
  medium: 'var(--color-warning)',
  low: 'var(--color-success)',
};

const IMPACT_BG: Record<string, string> = {
  high: 'var(--color-error-light)',
  medium: 'var(--color-warning-light)',
  low: 'var(--color-success-light)',
};

function getMockAlerts(): TransitAlert[] {
  return [
    {
      id: 't1',
      planet: 'Saturn', planetHi: '\u0936\u0928\u093F',
      fromSign: 'Aquarius', toSign: 'Pisces',
      fromSignHi: '\u0915\u0941\u0902\u092D', toSignHi: '\u092E\u0940\u0928',
      impactLevel: 'high',
      title: 'Saturn Transit to Pisces', titleHi: '\u0936\u0928\u093F \u0915\u093E \u092E\u0940\u0928 \u092E\u0947\u0902 \u0917\u094B\u091A\u0930',
      description: 'Saturn is moving into Pisces, affecting your 7th house. This may create temporary challenges in relationships and partnerships over the next 2.5 years.',
      descriptionHi: '\u0936\u0928\u093F \u092E\u0940\u0928 \u0930\u093E\u0936\u093F \u092E\u0947\u0902 \u092A\u094D\u0930\u0935\u0947\u0936 \u0915\u0930 \u0930\u0939\u093E \u0939\u0948, \u091C\u094B \u0906\u092A\u0915\u0947 7\u0935\u0947\u0902 \u092D\u093E\u0935 \u0915\u094B \u092A\u094D\u0930\u092D\u093E\u0935\u093F\u0924 \u0915\u0930\u0947\u0917\u093E\u0964 \u0905\u0917\u0932\u0947 2.5 \u0935\u0930\u094D\u0937 \u092E\u0947\u0902 \u0930\u093F\u0936\u094D\u0924\u094B\u0902 \u092E\u0947\u0902 \u0915\u0941\u091B \u091A\u0941\u0928\u094C\u0924\u093F\u092F\u093E\u0901 \u0906 \u0938\u0915\u0924\u0940 \u0939\u0948\u0902\u0964',
      affectedAreas: ['Relationships', 'Career', 'Health'],
      affectedAreasHi: ['\u0930\u093F\u0936\u094D\u0924\u0947', '\u0915\u0930\u093F\u092F\u0930', '\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F'],
      transitDate: 'Mar 29, 2026',
      isRead: false,
      remedies: [
        { type: 'mantra', name: 'Shani Mantra', nameHi: '\u0936\u0928\u093F \u092E\u0902\u0924\u094D\u0930', description: 'Chant 108 times on Saturdays', descriptionHi: '\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u094B 108 \u092C\u093E\u0930 \u091C\u092A\u0947\u0902', isFree: true },
        { type: 'puja', name: 'Shani Shanti Puja', nameHi: '\u0936\u0928\u093F \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E', description: 'Special puja at Shani temple', descriptionHi: '\u0936\u0928\u093F \u092E\u0902\u0926\u093F\u0930 \u092E\u0947\u0902 \u0935\u093F\u0936\u0947\u0937 \u092A\u0942\u091C\u093E', isFree: false, price: 2100 },
        { type: 'practice', name: 'Donate black sesame', nameHi: '\u0915\u093E\u0932\u0947 \u0924\u093F\u0932 \u0926\u093E\u0928 \u0915\u0930\u0947\u0902', description: 'Donate every Saturday', descriptionHi: '\u0939\u0930 \u0936\u0928\u093F\u0935\u093E\u0930 \u0926\u093E\u0928 \u0915\u0930\u0947\u0902', isFree: true },
      ],
    },
    {
      id: 't2',
      planet: 'Jupiter', planetHi: '\u092C\u0943\u0939\u0938\u094D\u092A\u0924\u093F',
      fromSign: 'Taurus', toSign: 'Gemini',
      fromSignHi: '\u0935\u0943\u0937\u092D', toSignHi: '\u092E\u093F\u0925\u0941\u0928',
      impactLevel: 'medium',
      title: 'Jupiter Transit to Gemini', titleHi: '\u092C\u0943\u0939\u0938\u094D\u092A\u0924\u093F \u0915\u093E \u092E\u093F\u0925\u0941\u0928 \u092E\u0947\u0902 \u0917\u094B\u091A\u0930',
      description: 'Jupiter moves into Gemini, positively influencing your 10th house of career. Good period for professional growth.',
      descriptionHi: '\u092C\u0943\u0939\u0938\u094D\u092A\u0924\u093F \u092E\u093F\u0925\u0941\u0928 \u092E\u0947\u0902 \u0906 \u0930\u0939\u0947 \u0939\u0948\u0902, \u0906\u092A\u0915\u0947 10\u0935\u0947\u0902 \u092D\u093E\u0935 \u092A\u0930 \u0936\u0941\u092D \u092A\u094D\u0930\u092D\u093E\u0935\u0964 \u0915\u0930\u093F\u092F\u0930 \u0915\u0947 \u0932\u093F\u090F \u0905\u091A\u094D\u091B\u093E \u0938\u092E\u092F\u0964',
      affectedAreas: ['Career', 'Finance'],
      affectedAreasHi: ['\u0915\u0930\u093F\u092F\u0930', '\u0935\u093F\u0924\u094D\u0924'],
      transitDate: 'Jun 14, 2026',
      isRead: true,
      remedies: [
        { type: 'mantra', name: 'Guru Mantra', nameHi: '\u0917\u0941\u0930\u0941 \u092E\u0902\u0924\u094D\u0930', description: 'Chant on Thursdays', descriptionHi: '\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u094B \u091C\u092A\u0947\u0902', isFree: true },
      ],
    },
  ];
}

export default function TransitPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [alerts, setAlerts] = useState<TransitAlert[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setAlerts(getMockAlerts());
  }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);
  const selected = alerts.find((a) => a.id === selectedId);

  return (
    <div className={styles.appLayout}>
      <TopBar title={t('\u0917\u094D\u0930\u0939 \u0917\u094B\u091A\u0930', 'Transit Alerts')} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {!selected ? (
            <>
              <p className={styles.subtitle}>
                {t('\u0906\u092A\u0915\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092A\u0930 \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0947 \u092A\u094D\u0930\u092D\u093E\u0935', 'Planetary transits affecting your chart')}
              </p>

              <div className={styles.alertList}>
                {alerts.map((a) => (
                  <button
                    key={a.id}
                    className={`${styles.alertCard} ${!a.isRead ? styles.alertCardUnread : ''}`}
                    onClick={() => setSelectedId(a.id)}
                  >
                    <div className={styles.alertLeft}>
                      <span
                        className={styles.impactDot}
                        style={{ background: IMPACT_COLORS[a.impactLevel] }}
                      />
                      <div className={styles.alertInfo}>
                        <span className={styles.alertTitle}>{t(a.titleHi, a.title)}</span>
                        <span className={styles.alertMeta}>
                          {t(a.planetHi, a.planet)} &mdash; {a.transitDate}
                        </span>
                        <div className={styles.alertTags}>
                          {(language === 'hi' ? a.affectedAreasHi : a.affectedAreas).map((area) => (
                            <span key={area} className={styles.alertTag}>{area}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span
                      className={styles.impactBadge}
                      style={{ background: IMPACT_BG[a.impactLevel], color: IMPACT_COLORS[a.impactLevel] }}
                    >
                      {a.impactLevel === 'high' ? t('\u0924\u0940\u0935\u094D\u0930', 'High') : a.impactLevel === 'medium' ? t('\u092E\u0927\u094D\u092F\u092E', 'Medium') : t('\u0939\u0932\u094D\u0915\u093E', 'Low')}
                    </span>
                  </button>
                ))}
              </div>

              {alerts.length === 0 && (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>{'\uD83C\uDF1F'}</span>
                  <p className={styles.emptyText}>{t('\u0915\u094B\u0908 \u0928\u0908 transit alert \u0928\u0939\u0940\u0902', 'No transit alerts right now')}</p>
                </div>
              )}
            </>
          ) : (
            /* Detail View */
            <div className={styles.detailView}>
              <button className={styles.backBtn} onClick={() => setSelectedId(null)}>
                {'\u2190'} {t('\u0935\u093E\u092A\u0938', 'Back')}
              </button>

              <div className={styles.detailHeader} style={{ borderLeftColor: IMPACT_COLORS[selected.impactLevel] }}>
                <h2 className={styles.detailTitle}>{t(selected.titleHi, selected.title)}</h2>
                <p className={styles.detailDate}>
                  {t(selected.planetHi, selected.planet)}: {t(selected.fromSignHi, selected.fromSign)} → {t(selected.toSignHi, selected.toSign)} &mdash; {selected.transitDate}
                </p>
                <span
                  className={styles.impactBadge}
                  style={{ background: IMPACT_BG[selected.impactLevel], color: IMPACT_COLORS[selected.impactLevel] }}
                >
                  {t('\u092A\u094D\u0930\u092D\u093E\u0935', 'Impact')}: {selected.impactLevel === 'high' ? t('\u0924\u0940\u0935\u094D\u0930', 'High') : selected.impactLevel === 'medium' ? t('\u092E\u0927\u094D\u092F\u092E', 'Medium') : t('\u0939\u0932\u094D\u0915\u093E', 'Low')}
                </span>
              </div>

              <div className={styles.detailBody}>
                <p className={styles.detailDesc}>{t(selected.descriptionHi, selected.description)}</p>

                <div className={styles.affectedSection}>
                  <h4 className={styles.subHeading}>{t('\u092A\u094D\u0930\u092D\u093E\u0935\u093F\u0924 \u0915\u094D\u0937\u0947\u0924\u094D\u0930', 'Affected Areas')}</h4>
                  <div className={styles.alertTags}>
                    {(language === 'hi' ? selected.affectedAreasHi : selected.affectedAreas).map((area) => (
                      <span key={area} className={styles.alertTag}>{area}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.remediesSection}>
                  <h4 className={styles.subHeading}>{t('\u0909\u092A\u093E\u092F', 'Remedies')}</h4>
                  <div className={styles.remedyList}>
                    {selected.remedies.map((r, idx) => (
                      <div key={idx} className={styles.remedyItem}>
                        <div className={styles.remedyItemLeft}>
                          <span className={styles.remedyIcon}>
                            {r.type === 'mantra' ? '\uD83D\uDCFF' : r.type === 'puja' ? '\uD83D\uDED5' : '\uD83C\uDF81'}
                          </span>
                          <div>
                            <span className={styles.remedyName}>{t(r.nameHi, r.name)}</span>
                            <span className={styles.remedyDesc}>{t(r.descriptionHi, r.description)}</span>
                          </div>
                        </div>
                        {r.isFree ? (
                          <span className={styles.freeTag}>{t('\u092E\u0941\u092B\u094D\u0924', 'Free')}</span>
                        ) : (
                          <span className={styles.priceTag}>{'\u20B9'}{r.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomTabBar language={language} />
    </div>
  );
}

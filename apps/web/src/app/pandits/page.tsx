'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface PanditItem {
  id: string;
  name: string;
  nameHi: string;
  specialities: string[];
  specialitiesHi: string[];
  experience: number;
  rating: number;
  totalConsultations: number;
  pricePerMinChat: number;
  pricePerMinCall: number;
  languages: string[];
  isOnline: boolean;
  photoPlaceholder: string;
}

const SPECIALITY_FILTERS = [
  { key: 'all', en: 'All', hi: '\u0938\u092D\u0940' },
  { key: 'marriage', en: 'Marriage', hi: '\u0935\u093F\u0935\u093E\u0939' },
  { key: 'career', en: 'Career', hi: '\u0915\u0930\u093F\u092F\u0930' },
  { key: 'health', en: 'Health', hi: '\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F' },
  { key: 'finance', en: 'Finance', hi: '\u0927\u0928' },
  { key: 'manglik', en: 'Manglik', hi: '\u092E\u093E\u0902\u0917\u0932\u093F\u0915' },
];

function getMockPandits(): PanditItem[] {
  return [
    {
      id: 'pd1', name: 'Pandit Ramesh Shastri', nameHi: '\u092A\u0902\u0921\u093F\u0924 \u0930\u092E\u0947\u0936 \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940',
      specialities: ['Marriage', 'Manglik', 'Kundli Match'],
      specialitiesHi: ['\u0935\u093F\u0935\u093E\u0939', '\u092E\u093E\u0902\u0917\u0932\u093F\u0915', '\u0915\u0941\u0902\u0921\u0932\u0940 \u092E\u093F\u0932\u093E\u0928'],
      experience: 15, rating: 4.8, totalConsultations: 1250,
      pricePerMinChat: 1500, pricePerMinCall: 2500,
      languages: ['Hindi', 'English', 'Sanskrit'],
      isOnline: true, photoPlaceholder: '\uD83E\uDDD1\u200D\uD83D\uDD2E',
    },
    {
      id: 'pd2', name: 'Acharya Vidya Bhushan', nameHi: '\u0906\u091A\u093E\u0930\u094D\u092F \u0935\u093F\u0926\u094D\u092F\u093E \u092D\u0942\u0937\u0923',
      specialities: ['Career', 'Finance', 'Business'],
      specialitiesHi: ['\u0915\u0930\u093F\u092F\u0930', '\u0927\u0928', '\u0935\u094D\u092F\u0935\u0938\u093E\u092F'],
      experience: 22, rating: 4.9, totalConsultations: 2100,
      pricePerMinChat: 2000, pricePerMinCall: 3500,
      languages: ['Hindi', 'English'],
      isOnline: false, photoPlaceholder: '\uD83D\uDC68\u200D\uD83C\uDF93',
    },
    {
      id: 'pd3', name: 'Pandit Suresh Joshi', nameHi: '\u092A\u0902\u0921\u093F\u0924 \u0938\u0941\u0930\u0947\u0936 \u091C\u094B\u0936\u0940',
      specialities: ['Health', 'Marriage', 'Kaal Sarp'],
      specialitiesHi: ['\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F', '\u0935\u093F\u0935\u093E\u0939', '\u0915\u093E\u0932 \u0938\u0930\u094D\u092A'],
      experience: 12, rating: 4.6, totalConsultations: 800,
      pricePerMinChat: 1200, pricePerMinCall: 2000,
      languages: ['Hindi'],
      isOnline: true, photoPlaceholder: '\uD83E\uDDD4',
    },
  ];
}

export default function PanditsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [pandits, setPandits] = useState<PanditItem[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setPandits(getMockPandits());
  }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);

  const filtered = filter === 'all'
    ? pandits
    : pandits.filter((p) =>
        p.specialities.some((s) => s.toLowerCase() === filter.toLowerCase())
      );

  const formatPrice = (paise: number) => `\u20B9${Math.round(paise / 100)}`;

  return (
    <div className={styles.appLayout}>
      <TopBar title={t('\u092A\u0902\u0921\u093F\u0924 \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0947\u0902', 'Talk to a Pandit')} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* AI Note */}
          <div className={styles.aiNote}>
            <span className={styles.aiNoteIcon}>{'\uD83E\uDD16'}</span>
            <p className={styles.aiNoteText}>
              {t(
                'AI \u0928\u0947 \u0906\u092A\u0915\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u0915\u093E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u093F\u092F\u093E \u0939\u0948\u0964 \u0905\u092C \u0905\u0928\u0941\u092D\u0935\u0940 \u092A\u0902\u0921\u093F\u0924 \u0938\u0947 \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928 \u092A\u093E\u090F\u0902\u0964',
                'AI has analyzed your kundli. Now get detailed guidance from an experienced pandit.'
              )}
            </p>
          </div>

          {/* Speciality Filter Chips */}
          <div className={styles.filterRow}>
            {SPECIALITY_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {t(f.hi, f.en)}
              </button>
            ))}
          </div>

          {/* Pandit Cards */}
          <div className={styles.panditList}>
            {filtered.map((p) => (
              <div key={p.id} className={styles.panditCard}>
                <div className={styles.panditTop}>
                  <div className={styles.panditAvatar}>
                    <span>{p.photoPlaceholder}</span>
                    {p.isOnline && <span className={styles.onlineDot} />}
                  </div>
                  <div className={styles.panditInfo}>
                    <span className={styles.panditName}>{t(p.nameHi, p.name)}</span>
                    <span className={styles.panditExp}>
                      {p.experience} {t('\u0935\u0930\u094D\u0937 \u0905\u0928\u0941\u092D\u0935', 'yrs exp')} &middot; {p.totalConsultations}+ {t('\u092A\u0930\u093E\u092E\u0930\u094D\u0936', 'sessions')}
                    </span>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingStar}>{'\u2B50'}</span>
                      <span className={styles.ratingValue}>{p.rating}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.panditSpecialities}>
                  {(language === 'hi' ? p.specialitiesHi : p.specialities).map((s) => (
                    <span key={s} className={styles.specTag}>{s}</span>
                  ))}
                </div>

                <div className={styles.panditPricing}>
                  <div className={styles.priceCol}>
                    <span className={styles.priceLabel}>{t('\u091A\u0948\u091F', 'Chat')}</span>
                    <span className={styles.priceValue}>{formatPrice(p.pricePerMinChat)}/min</span>
                  </div>
                  <div className={styles.priceCol}>
                    <span className={styles.priceLabel}>{t('\u0915\u0949\u0932', 'Call')}</span>
                    <span className={styles.priceValue}>{formatPrice(p.pricePerMinCall)}/min</span>
                  </div>
                </div>

                <div className={styles.panditActions}>
                  <button
                    className={styles.chatBtn}
                    onClick={() => router.push(`/pandits/session?panditId=${p.id}&type=chat`)}
                  >
                    {'\uD83D\uDCAC'} {t('\u091A\u0948\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'Start Chat')}
                  </button>
                  <button
                    className={styles.callBtn}
                    onClick={() => router.push(`/pandits/session?panditId=${p.id}&type=call`)}
                  >
                    {'\uD83D\uDCDE'} {t('\u0915\u0949\u0932 \u0915\u0930\u0947\u0902', 'Call')}
                  </button>
                </div>

                {!p.isOnline && (
                  <span className={styles.offlineNote}>
                    {t('\u0905\u092D\u0940 \u0911\u092B\u0932\u093E\u0907\u0928 \u2014 \u092C\u093E\u0926 \u092E\u0947\u0902 \u0906\u090F\u0902', 'Currently offline \u2014 check back later')}
                  </span>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>{'\uD83D\uDD0D'}</span>
              <p className={styles.emptyText}>{t('\u0915\u094B\u0908 \u092A\u0902\u0921\u093F\u0924 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E', 'No pandits found for this speciality')}</p>
            </div>
          )}
        </div>
      </main>
      <BottomTabBar language={language} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

const SEVA_TYPES = [
  {
    key: 'gau_seva',
    emoji: '\uD83D\uDC04',
    hi: 'गौ सेवा',
    en: 'Gau Seva',
    priceRange: '\u20B9151 - \u20B9501',
    descHi: 'गाय की सेवा करें और पुण्य कमाएं',
    descEn: 'Serve the holy cow and earn punya',
  },
  {
    key: 'brahman_bhoj',
    emoji: '\uD83D\uDE4F',
    hi: 'ब्राह्मण भोज',
    en: 'Brahman Bhoj',
    priceRange: '\u20B9251 - \u20B91,100',
    descHi: 'ब्राह्मणों को भोजन कराएं',
    descEn: 'Feed Brahmins a sacred meal',
  },
  {
    key: 'vastra_daan',
    emoji: '\uD83D\uDC55',
    hi: 'वस्त्र दान',
    en: 'Vastra Daan',
    priceRange: '\u20B9201 - \u20B9501',
    descHi: 'जरूरतमंदों को वस्त्र दान करें',
    descEn: 'Donate clothes to the needy',
  },
  {
    key: 'anna_daan',
    emoji: '\uD83C\uDF5A',
    hi: 'अन्न दान',
    en: 'Anna Daan',
    priceRange: '\u20B9151 - \u20B9351',
    descHi: 'भूखों को अन्न दान करें',
    descEn: 'Donate food to the hungry',
  },
];

const MOCK_TEMPLES = [
  { id: 't1', name: 'श्री काशी विश्वनाथ मंदिर', nameEn: 'Kashi Vishwanath Temple', city: 'Varanasi' },
  { id: 't2', name: 'श्री सिद्धिविनायक मंदिर', nameEn: 'Siddhivinayak Temple', city: 'Mumbai' },
  { id: 't3', name: 'श्री महाकालेश्वर मंदिर', nameEn: 'Mahakaleshwar Temple', city: 'Ujjain' },
];

const MOCK_BOOKINGS = [
  {
    id: 'b1',
    sevaType: 'गौ सेवा',
    sevaTypeEn: 'Gau Seva',
    temple: 'श्री काशी विश्वनाथ मंदिर',
    templeEn: 'Kashi Vishwanath Temple',
    date: '2026-02-20',
    amount: 251,
    status: 'completed' as const,
    statusHi: 'पूर्ण',
    statusEn: 'Completed',
    hasPhoto: true,
  },
  {
    id: 'b2',
    sevaType: 'अन्न दान',
    sevaTypeEn: 'Anna Daan',
    temple: 'श्री सिद्धिविनायक मंदिर',
    templeEn: 'Siddhivinayak Temple',
    date: '2026-03-01',
    amount: 151,
    status: 'upcoming' as const,
    statusHi: 'आगामी',
    statusEn: 'Upcoming',
    hasPhoto: false,
  },
];

export default function SevaPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [selectedSeva, setSelectedSeva] = useState<string | null>(null);
  const [selectedTemple, setSelectedTemple] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleSevaSelect = (key: string) => {
    setSelectedSeva(selectedSeva === key ? null : key);
    setSelectedTemple(null);
  };

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'दान सेवा' : 'Daan Seva'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Hero Section */}
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              {language === 'hi' ? 'दान करें, पुण्य कमाएं' : 'Give Daan, Earn Punya'}
            </h1>
            <p className={styles.heroSub}>
              {language === 'hi'
                ? 'अपने दोषों के निवारण के लिए दान सेवा करें'
                : 'Perform Daan Seva to remedy your doshas'}
            </p>
          </div>

          {/* Seva Type Cards */}
          <section className={styles.sevaSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'सेवा चुनें' : 'Choose Seva'}
            </h2>
            <div className={styles.sevaGrid}>
              {SEVA_TYPES.map((seva) => (
                <button
                  key={seva.key}
                  className={`${styles.sevaCard} ${selectedSeva === seva.key ? styles.sevaCardSelected : ''}`}
                  onClick={() => handleSevaSelect(seva.key)}
                >
                  <span className={styles.sevaEmoji}>{seva.emoji}</span>
                  <span className={styles.sevaName}>
                    {language === 'hi' ? seva.hi : seva.en}
                  </span>
                  <span className={styles.sevaNameSub}>
                    {language === 'hi' ? seva.en : seva.hi}
                  </span>
                  <span className={styles.sevaPrice}>{seva.priceRange}</span>
                  <span className={styles.sevaProofBadge}>
                    {language === 'hi' ? '\uD83D\uDCF7 फोटो प्रमाण शामिल' : '\uD83D\uDCF7 Photo proof included'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Temple Selection (visible when a seva type is selected) */}
          {selectedSeva && (
            <section className={styles.templeSection}>
              <h2 className={styles.sectionTitle}>
                {language === 'hi' ? 'मंदिर चुनें' : 'Select Temple'}
              </h2>
              <div className={styles.templeList}>
                {MOCK_TEMPLES.map((temple) => (
                  <button
                    key={temple.id}
                    className={`${styles.templeCard} ${selectedTemple === temple.id ? styles.templeCardSelected : ''}`}
                    onClick={() => setSelectedTemple(temple.id)}
                  >
                    <span className={styles.templeIcon}>\uD83D\uDED5</span>
                    <div className={styles.templeInfo}>
                      <span className={styles.templeName}>
                        {language === 'hi' ? temple.name : temple.nameEn}
                      </span>
                      <span className={styles.templeCity}>{temple.city}</span>
                    </div>
                    {selectedTemple === temple.id && (
                      <span className={styles.checkmark}>\u2713</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Book Seva CTA */}
              <button
                className={styles.bookCta}
                disabled={!selectedTemple}
              >
                {language === 'hi' ? 'सेवा बुक करें' : 'Book Seva'}
              </button>
            </section>
          )}

          {/* My Seva Bookings */}
          <section className={styles.bookingsSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'मेरी सेवा बुकिंग' : 'My Seva Bookings'}
            </h2>
            <div className={styles.bookingsList}>
              {MOCK_BOOKINGS.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <span className={styles.bookingType}>
                      {language === 'hi' ? booking.sevaType : booking.sevaTypeEn}
                    </span>
                    <span
                      className={`${styles.bookingStatus} ${
                        booking.status === 'completed' ? styles.statusCompleted : styles.statusUpcoming
                      }`}
                    >
                      {language === 'hi' ? booking.statusHi : booking.statusEn}
                    </span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <span className={styles.bookingTemple}>
                      \uD83D\uDED5 {language === 'hi' ? booking.temple : booking.templeEn}
                    </span>
                    <span className={styles.bookingDate}>
                      \uD83D\uDCC5 {booking.date}
                    </span>
                    <span className={styles.bookingAmount}>\u20B9{booking.amount}</span>
                  </div>
                  {booking.hasPhoto && (
                    <span className={styles.photoProof}>
                      {language === 'hi' ? '\uD83D\uDCF7 फोटो प्रमाण उपलब्ध' : '\uD83D\uDCF7 Photo proof available'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

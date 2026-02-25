'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface PujaDetail {
  id: string;
  name: string;
  nameHi: string;
  deity: string;
  deityHi: string;
  description: string;
  descriptionHi: string;
  price: number;
  inclusions: string[];
  inclusionsHi: string[];
  images: string[];
  templeName: string;
  templeNameHi: string;
  templeCity: string;
  templeState: string;
  templeRating: number;
  templeTotalPujas: number;
  templeDescription: string;
  templeDescriptionHi: string;
}

const MOCK_PUJA: PujaDetail = {
  id: 'p1',
  name: 'Mangal Dosha Nivaran Puja',
  nameHi: 'मंगल दोष निवारण पूजा',
  deity: 'Lord Hanuman',
  deityHi: 'हनुमान जी',
  description: 'Complete Mangal Dosha Nivaran Puja performed by experienced pandits at the sacred Mangalnath Temple in Ujjain. This puja specifically addresses Mars afflictions in the birth chart, removing obstacles in marriage and relationships.',
  descriptionHi: 'उज्जैन के पवित्र मंगलनाथ मंदिर में अनुभवी पंडितों द्वारा सम्पूर्ण मंगल दोष निवारण पूजा। यह पूजा विशेष रूप से कुंडली में मंगल ग्रह के दोषों को दूर करती है, शादी और रिश्तों में आने वाली बाधाओं को हटाती है।',
  price: 2100,
  inclusions: [
    'Full vidhi puja with Vedic mantras',
    'Your name + gotra in sankalp',
    'HD video of complete puja (3-5 min)',
    'Photos of the ritual',
    'Consecrated prasad shipped to you',
    'Digital completion certificate',
  ],
  inclusionsHi: [
    'पूर्ण विधि-विधान से वैदिक मंत्रों के साथ पूजा',
    'आपका नाम + गोत्र संकल्प में',
    'पूरी पूजा का HD video (3-5 min)',
    'पूजा की photos',
    'अभिमंत्रित प्रसाद आपके घर',
    'Digital completion certificate',
  ],
  images: [],
  templeName: 'Mangalnath Temple',
  templeNameHi: 'मंगलनाथ मंदिर',
  templeCity: 'Ujjain',
  templeState: 'Madhya Pradesh',
  templeRating: 4.8,
  templeTotalPujas: 1250,
  templeDescription: 'Mangalnath Temple in Ujjain is considered the birth place of Mars (Mangal) and is the most revered temple for Mangal Dosha Nivaran. Pandits here have been performing these pujas for generations.',
  templeDescriptionHi: 'उज्जैन का मंगलनाथ मंदिर मंगल ग्रह का जन्म स्थान माना जाता है और मंगल दोष निवारण के लिए सबसे पवित्र मंदिर है। यहाँ के पंडित पीढ़ियों से ये पूजाएं करते आ रहे हैं।',
};

const INCLUSION_ICONS = ['🪔', '📿', '🎥', '📸', '📦', '📜'];

function PujaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [puja] = useState<PujaDetail>(MOCK_PUJA);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleBookPuja = () => {
    router.push(`/puja/book?pujaId=${puja.id}`);
  };

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={language === 'hi' ? puja.nameHi : puja.name} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Hero image placeholder */}
          <div className={styles.heroImage}>
            <div className={styles.heroOverlay}>
              <span className={styles.heroIcon}>🪔</span>
            </div>
          </div>

          {/* Puja title and price */}
          <div className={styles.titleSection}>
            <h1 className={styles.pujaName}>
              {language === 'hi' ? puja.nameHi : puja.name}
            </h1>
            <p className={styles.deityName}>
              {language === 'hi' ? puja.deityHi : puja.deity}
            </p>
            <div className={styles.priceRow}>
              <span className={styles.price}>₹{puja.price.toLocaleString('en-IN')}</span>
              <span className={styles.priceNote}>
                {language === 'hi' ? '(प्रसाद delivery free)' : '(free prasad delivery)'}
              </span>
            </div>
          </div>

          {/* Temple info card */}
          <div className={styles.templeCard}>
            <div className={styles.templeCardHeader}>
              <span className={styles.templeIcon}>🛕</span>
              <div className={styles.templeInfo}>
                <h3 className={styles.templeName}>
                  {language === 'hi' ? puja.templeNameHi : puja.templeName}
                </h3>
                <span className={styles.templeLocation}>
                  {puja.templeCity}, {puja.templeState}
                </span>
              </div>
              <div className={styles.templeStats}>
                <div className={styles.ratingBadge}>
                  <span className={styles.ratingStar}>★</span>
                  <span>{puja.templeRating}</span>
                </div>
              </div>
            </div>
            <p className={styles.templeDesc}>
              {language === 'hi' ? puja.templeDescriptionHi : puja.templeDescription}
            </p>
            <div className={styles.templeMetaRow}>
              <span className={styles.templeMeta}>
                {puja.templeTotalPujas.toLocaleString('en-IN')}+ {language === 'hi' ? 'पूजाएं सम्पन्न' : 'pujas completed'}
              </span>
            </div>
          </div>

          {/* What's included */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'क्या-क्या शामिल है:' : "What's included:"}
            </h2>
            <div className={styles.inclusionsList}>
              {(language === 'hi' ? puja.inclusionsHi : puja.inclusions).map((item, index) => (
                <div key={index} className={styles.inclusionItem}>
                  <span className={styles.inclusionIcon}>{INCLUSION_ICONS[index] || '✓'}</span>
                  <span className={styles.inclusionText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'इस पूजा के बारे में' : 'About this puja'}
            </h2>
            <p className={styles.descriptionText}>
              {language === 'hi' ? puja.descriptionHi : puja.description}
            </p>
          </div>

          {/* Delivery info */}
          <div className={styles.deliveryCard}>
            <h3 className={styles.deliveryTitle}>
              {language === 'hi' ? 'Delivery:' : 'Delivery:'}
            </h3>
            <div className={styles.deliveryItem}>
              <span className={styles.deliveryIcon}>🎥</span>
              <span className={styles.deliveryText}>
                {language === 'hi' ? 'Video: पूजा के 3-5 दिन बाद' : 'Video: 3-5 days after puja'}
              </span>
            </div>
            <div className={styles.deliveryItem}>
              <span className={styles.deliveryIcon}>📦</span>
              <span className={styles.deliveryText}>
                {language === 'hi' ? 'प्रसाद: 7-10 दिन (free shipping)' : 'Prasad: 7-10 days (free shipping)'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky book button */}
      <div className={styles.stickyFooter}>
        <div className={styles.stickyFooterInner}>
          <div className={styles.stickyPrice}>
            <span className={styles.stickyPriceLabel}>₹{puja.price.toLocaleString('en-IN')}</span>
          </div>
          <button className={styles.bookButton} onClick={handleBookPuja}>
            {language === 'hi' ? 'पूजा Book करें' : 'Book Puja'}
          </button>
        </div>
      </div>

      <BottomTabBar language={language} />
    </div>
  );
}

export default function PujaPage() {
  return (
    <Suspense>
      <PujaPageContent />
    </Suspense>
  );
}

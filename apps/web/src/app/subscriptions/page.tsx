'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface PlanFeature {
  text: string;
  textEn: string;
  included: boolean;
}

interface Plan {
  key: string;
  tier: string;
  tierEn: string;
  price: number;
  recommended: boolean;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    key: 'basic',
    tier: 'बेसिक',
    tierEn: 'Basic',
    price: 999,
    recommended: false,
    features: [
      { text: 'मंत्र ट्रैकिंग', textEn: 'Mantra tracking', included: true },
      { text: 'मुफ़्त उपाय ट्रैकिंग', textEn: 'Free remedies tracking', included: true },
      { text: 'प्रोटोकॉल कैलेंडर', textEn: 'Protocol calendar', included: true },
      { text: '1 पूजा/माह', textEn: '1 puja/month', included: false },
      { text: '1 आध्यात्मिक उत्पाद', textEn: '1 spiritual product', included: false },
      { text: 'प्राथमिकता AI सहायता', textEn: 'Priority AI support', included: false },
      { text: 'पंडित परामर्श', textEn: 'Pandit consultation', included: false },
      { text: 'असीमित मुहूर्त', textEn: 'Unlimited muhurta', included: false },
    ],
  },
  {
    key: 'standard',
    tier: 'स्टैंडर्ड',
    tierEn: 'Standard',
    price: 1999,
    recommended: true,
    features: [
      { text: 'मंत्र ट्रैकिंग', textEn: 'Mantra tracking', included: true },
      { text: 'मुफ़्त उपाय ट्रैकिंग', textEn: 'Free remedies tracking', included: true },
      { text: 'प्रोटोकॉल कैलेंडर', textEn: 'Protocol calendar', included: true },
      { text: '1 पूजा/माह', textEn: '1 puja/month', included: true },
      { text: '1 आध्यात्मिक उत्पाद', textEn: '1 spiritual product', included: true },
      { text: 'प्राथमिकता AI सहायता', textEn: 'Priority AI support', included: true },
      { text: 'पंडित परामर्श', textEn: 'Pandit consultation', included: false },
      { text: 'असीमित मुहूर्त', textEn: 'Unlimited muhurta', included: false },
    ],
  },
  {
    key: 'premium',
    tier: 'प्रीमियम',
    tierEn: 'Premium',
    price: 2999,
    recommended: false,
    features: [
      { text: 'मंत्र ट्रैकिंग', textEn: 'Mantra tracking', included: true },
      { text: 'मुफ़्त उपाय ट्रैकिंग', textEn: 'Free remedies tracking', included: true },
      { text: 'प्रोटोकॉल कैलेंडर', textEn: 'Protocol calendar', included: true },
      { text: '2 पूजा/माह', textEn: '2 pujas/month', included: true },
      { text: 'रेमेडी किट', textEn: 'Remedy kit', included: true },
      { text: 'प्राथमिकता AI सहायता', textEn: 'Priority AI support', included: true },
      { text: 'पंडित परामर्श', textEn: 'Pandit consultation', included: true },
      { text: 'असीमित मुहूर्त', textEn: 'Unlimited muhurta', included: true },
    ],
  },
];

export default function SubscriptionsPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'सब्सक्रिप्शन प्लान' : 'Subscription Plans'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>
              {language === 'hi' ? '9-सप्ताह रेमेडी प्रोटोकॉल' : '9-Week Remedy Protocol'}
            </h1>
            <p className={styles.headerSub}>
              {language === 'hi'
                ? 'अपने दोषों के लिए व्यापक उपाय — एक प्लान में'
                : 'Comprehensive remedies for your doshas — in one plan'}
            </p>
          </div>

          {/* Plan Cards */}
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`${styles.planCard} ${plan.recommended ? styles.planCardRecommended : ''}`}
              >
                {plan.recommended && (
                  <div className={styles.recommendedRibbon}>
                    {language === 'hi' ? 'अनुशंसित' : 'Recommended'}
                  </div>
                )}

                <div className={styles.planHeader}>
                  <h3 className={styles.planTier}>
                    {language === 'hi' ? plan.tier : plan.tierEn}
                  </h3>
                  <div className={styles.planPricing}>
                    <span className={styles.planPrice}>\u20B9{plan.price.toLocaleString()}</span>
                    <span className={styles.planPeriod}>
                      /{language === 'hi' ? 'माह' : 'mo'}
                    </span>
                  </div>
                </div>

                <ul className={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`${styles.featureItem} ${!feature.included ? styles.featureDisabled : ''}`}
                    >
                      <span className={styles.featureIcon}>
                        {feature.included ? '\u2713' : '\u2717'}
                      </span>
                      <span className={styles.featureText}>
                        {language === 'hi' ? feature.text : feature.textEn}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${styles.subscribeCta} ${plan.recommended ? styles.subscribeCtaPrimary : ''}`}
                >
                  {language === 'hi' ? 'सब्सक्राइब करें' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>

          {/* Current Subscription Status */}
          <div className={styles.statusSection}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'आपका सब्सक्रिप्शन' : 'Your Subscription'}
            </h2>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>\uD83D\uDCCB</div>
              <p className={styles.statusText}>
                {language === 'hi'
                  ? 'कोई सक्रिय सब्सक्रिप्शन नहीं है'
                  : 'No active subscription'}
              </p>
              <p className={styles.statusHint}>
                {language === 'hi'
                  ? 'अपनी remedies को supercharge करने के लिए एक प्लान चुनें'
                  : 'Choose a plan to supercharge your remedies'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

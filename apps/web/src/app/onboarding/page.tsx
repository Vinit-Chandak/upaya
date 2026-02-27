'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslations } from '@upaya/shared';
import styles from './page.module.css';

const TRUST_BADGES = [
  { icon: '📊', label: '50,000+', sublabel: 'Kundlis analyzed' },
  { icon: '🛕', label: '100+', sublabel: 'Temples verified' },
  { icon: '📹', label: 'Video proof', sublabel: 'of every puja' },
  { icon: '📦', label: 'Prasad', sublabel: 'delivered home' },
  { icon: '🔒', label: '100%', sublabel: 'Private & Secure' },
  { icon: '🙏', label: 'Pandit', sublabel: 'verified' },
];

const STEPS = [
  {
    icon: '💬',
    title: 'अपनी problem बताएं',
    titleEn: 'Tell your problem',
    desc: 'AI empathetically समझेगा',
    descEn: 'AI understands empathetically',
  },
  {
    icon: '📊',
    title: 'AI आपकी कुंडली analyze करे',
    titleEn: 'AI analyzes your kundli',
    desc: 'Exact ग्रह और दोष ढूंढेगा',
    descEn: 'Finds exact planets and doshas',
  },
  {
    icon: '📜',
    title: 'Personalized remedy plan',
    titleEn: 'Personalized remedy plan',
    desc: 'Specific मंत्र, temples, timing — सब कुछ tailored',
    descEn: 'Specific mantras, temples, timing — all tailored',
  },
  {
    icon: '🛕',
    title: 'Temple पूजा + Video proof',
    titleEn: 'Temple puja + Video proof',
    desc: 'Real पूजा at real temple, video delivered, प्रसाद shipped',
    descEn: 'Real puja at real temple, video delivered, prasad shipped',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [stepsVisible, setStepsVisible] = useState<boolean[]>([false, false, false, false]);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const language = typeof window !== 'undefined'
    ? (localStorage.getItem('upaya_language') as 'hi' | 'en') || 'hi'
    : 'hi';

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('upaya_onboarding_completed', 'true');
    router.replace('/home');
  }, [router]);

  const goToScreen = useCallback((index: number) => {
    if (index < 0 || index > 2) return;
    setCurrentScreen(index);
  }, []);

  const goNext = useCallback(() => {
    if (currentScreen < 2) {
      goToScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  }, [currentScreen, goToScreen, completeOnboarding]);

  // Staggered animation for steps on screen 2
  useEffect(() => {
    if (currentScreen === 1) {
      setStepsVisible([false, false, false, false]);
      STEPS.forEach((_, i) => {
        setTimeout(() => {
          setStepsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 200 * (i + 1));
      });
    }
  }, [currentScreen]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) {
      goNext();
    } else if (diff < -threshold && currentScreen > 0) {
      goToScreen(currentScreen - 1);
    }
  };

  return (
    <main className={styles.main}>
      {/* Skip button */}
      <button className={styles.skipButton} onClick={completeOnboarding}>
        Skip &rarr;
      </button>

      {/* Screen container with swipe support */}
      <div
        ref={containerRef}
        className={styles.screenContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.screenSlider}
          style={{ transform: `translateX(-${currentScreen * 100}%)` }}
        >
          {/* Screen 1: Emotional Hook */}
          <div className={styles.screen}>
            <div className={styles.screenContent}>
              <div className={styles.illustrationCircle}>
                <span className={styles.illustrationEmoji}>🙏</span>
              </div>
              <h2 className={styles.screenTitle}>
                {language === 'hi'
                  ? 'हमने आप जैसे लोगों की मदद की है'
                  : "We've Helped People Like You"}
              </h2>
              <div className={styles.testimonialCard}>
                <p className={styles.testimonialName}>
                  💍 {language === 'hi' ? 'प्रिया, 28, लखनऊ' : 'Priya, 28, Lucknow'}
                </p>
                <p className={styles.testimonialText}>
                  {language === 'hi'
                    ? '4 साल से शादी के रिश्ते आ के टूट रहे थे। सबने कहा मंगल दोष है, लेकिन कोई solution नहीं बताया।\n\nUpaya ने कुंडली analyze की → exact problem मिली → मंगलनाथ Temple में specific पूजा suggest की।\n\n5 महीने में रिश्ता पक्का हुआ। 🙏'
                    : "Marriage talks kept falling apart for 4 years. Everyone said it's Mangal Dosha but nobody gave a real solution.\n\nUpaya analyzed my chart, found the exact cause, and recommended a specific puja at Mangalnath Temple.\n\nGot married within 5 months. 🙏"}
                </p>
              </div>
            </div>
          </div>

          {/* Screen 2: How It Works */}
          <div className={styles.screen}>
            <div className={styles.screenContent}>
              <h2 className={styles.screenTitle}>
                {language === 'hi' ? 'Upaya कैसे काम करता है' : 'How Upaya Works'}
              </h2>
              <div className={styles.stepsContainer}>
                {STEPS.map((step, i) => (
                  <div key={i} className={styles.stepWrapper}>
                    <div
                      className={`${styles.stepRow} ${stepsVisible[i] ? styles.stepVisible : ''}`}
                    >
                      <div className={styles.stepIconCircle}>
                        <span className={styles.stepIcon}>{step.icon}</span>
                      </div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepTitle}>
                          {language === 'hi' ? step.title : step.titleEn}
                        </p>
                        <p className={styles.stepDesc}>
                          {language === 'hi' ? step.desc : step.descEn}
                        </p>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
                  </div>
                ))}
              </div>
              <p className={styles.tagline}>
                {language === 'hi'
                  ? 'Diagnosis से लेकर remedy execution तक — सब एक जगह'
                  : 'From diagnosis to remedy execution — all in one place'}
              </p>
            </div>
          </div>

          {/* Screen 3: Trust & CTA */}
          <div className={styles.screen}>
            <div className={styles.screenContent}>
              <h2 className={styles.screenTitle}>
                {getTranslations(language).onboarding.screen3.title}
              </h2>
              <div className={styles.badgeGrid}>
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.sublabel} className={styles.badge}>
                    <span className={styles.badgeIcon}>{badge.icon}</span>
                    <span className={styles.badgeLabel}>{badge.label}</span>
                    <span className={styles.badgeSublabel}>{badge.sublabel}</span>
                  </div>
                ))}
              </div>
              <div className={styles.miniTestimonial}>
                <p className={styles.stars}>&#11088;&#11088;&#11088;&#11088;&#11088;</p>
                <p className={styles.miniText}>
                  {language === 'hi'
                    ? '"पहली बार लगा कि किसी ने सच में समझा और सही रास्ता बताया"'
                    : '"For the first time, I felt truly understood and guided on the right path"'}
                </p>
                <p className={styles.miniAuthor}>
                  — {language === 'hi' ? 'राहुल S., दिल्ली' : 'Rahul S., Delhi'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Dots + Button */}
      <div className={styles.bottom}>
        <div className={styles.dots}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`${styles.dot} ${currentScreen === i ? styles.dotActive : ''}`}
              onClick={() => goToScreen(i)}
              aria-label={`Go to screen ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={`${styles.actionButton} ${currentScreen === 2 ? styles.actionButtonPrimary : ''}`}
          onClick={goNext}
        >
          {currentScreen < 2
            ? (language === 'hi' ? 'आगे बढ़ें →' : 'Next →')
            : (language === 'hi' ? '🙏 शुरू करें' : '🙏 Get Started')}
        </button>

        {currentScreen === 2 && (
          <p className={styles.ctaSub}>
            {language === 'hi'
              ? 'Free कुंडली analysis · No login required'
              : 'Free kundli analysis · No login required'}
          </p>
        )}
      </div>
    </main>
  );
}

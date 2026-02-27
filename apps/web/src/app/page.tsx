'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@upaya/shared';
import styles from './page.module.css';

/**
 * Splash Screen (Phase 1.1)
 * Auto-transitions to language selection or home (returning users) after 1.5s.
 * Animated logo with gradient background.
 */
export default function SplashScreen() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setFadeIn(true));

    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;

    const timer = setTimeout(() => {
      const onboardingDone = localStorage.getItem('upaya_onboarding_completed');

      if (stored && onboardingDone === 'true') {
        router.replace('/home');
      } else if (stored) {
        router.replace('/onboarding');
      } else {
        router.replace('/language');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className={`${styles.splashMain} ${fadeIn ? styles.splashFadeIn : ''}`}>
      <div className={styles.splashContent}>
        <div className={styles.splashLogo}>
          <span className={styles.splashSymbol}>&#10048;</span>
          <h1 className={styles.splashLogoText}>UPAYA</h1>
          <span className={styles.splashSymbol}>&#10048;</span>
        </div>
        <p className={styles.splashTagline}>{en.common.tagline}</p>
      </div>

      {/* Decorative particles */}
      <div className={styles.splashParticles}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={styles.splashParticle}
            style={{
              left: `${15 + i * 14}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </main>
  );
}

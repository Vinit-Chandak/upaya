'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@upaya/shared';
import CelestialBackground from '@/components/CelestialBackground/CelestialBackground';
import ShriYantra from '@/components/icons/ShriYantra';
import styles from './page.module.css';

/**
 * Splash Screen (Phase 1.1)
 * Auto-transitions to language selection or home (returning users) after 1.5s.
 * Animated logo with gradient background and celestial stars.
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
      <CelestialBackground variant="splash" />

      <div className={styles.splashContent}>
        <div className={styles.splashLogo}>
          <ShriYantra size={40} color="var(--color-accent-gold)" />
          <h1 className={styles.splashLogoText}>UPAYA</h1>
          <ShriYantra size={40} color="var(--color-accent-gold)" />
        </div>
        <p className={styles.splashTagline}>{en.common.tagline}</p>
      </div>
    </main>
  );
}

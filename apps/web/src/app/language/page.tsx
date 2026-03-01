'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import CelestialBackground from '@/components/CelestialBackground/CelestialBackground';
import NamasteHands from '@/components/icons/NamasteHands';
import LotusSymbol from '@/components/icons/LotusSymbol';
import GlobeIcon from '@/components/icons/GlobeIcon';
import HourglassClock from '@/components/icons/HourglassClock';
import styles from './page.module.css';

interface LanguageOption {
  code: 'hi' | 'en';
  name: string;
  sub: string;
  icon: ReactNode;
  enabled: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'हिन्दी', sub: 'Hindi', icon: <LotusSymbol size={28} color="#FF8C00" />, enabled: true },
  { code: 'en', name: 'English', sub: 'अंग्रेज़ी', icon: <GlobeIcon size={28} color="rgba(255,255,255,0.7)" />, enabled: true },
];

const COMING_SOON = [
  { name: 'தமிழ்', sub: 'Coming Soon', icon: <HourglassClock size={28} color="rgba(255,255,255,0.5)" /> },
  { name: 'తెలుగు', sub: 'Coming Soon', icon: <HourglassClock size={28} color="rgba(255,255,255,0.5)" /> },
];

export default function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const selectLanguage = (lang: 'hi' | 'en') => {
    setSelected(lang);
    localStorage.setItem('upaya_language', lang);
    // Small delay for visual feedback
    setTimeout(() => {
      router.replace('/onboarding');
    }, 200);
  };

  return (
    <main className={styles.main}>
      <CelestialBackground variant="subtle" />
      <div className={styles.container}>
        <span className={styles.namaste}>
          <NamasteHands size={48} color="#FF8C00" />
        </span>
        <h1 className={styles.title}>अपनी भाषा चुनें</h1>
        <p className={styles.subtitle}>Choose your preferred language</p>

        <div className={styles.options}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.card} ${selected === lang.code ? styles.cardSelected : ''}`}
              onClick={() => selectLanguage(lang.code)}
            >
              <span className={styles.flag}>{lang.icon}</span>
              <div className={styles.cardInfo}>
                <span className={styles.langName}>{lang.name}</span>
                <span className={styles.langSub}>{lang.sub}</span>
              </div>
              {selected === lang.code && (
                <span className={styles.checkmark}>&#10003;</span>
              )}
            </button>
          ))}

          {COMING_SOON.map((lang) => (
            <div
              key={lang.name}
              className={`${styles.card} ${styles.cardDisabled}`}
            >
              <span className={styles.flag}>{lang.icon}</span>
              <div className={styles.cardInfo}>
                <span className={styles.langName}>{lang.name}</span>
                <span className={styles.langSub}>{lang.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.hint}>
          आप इसे कभी भी Settings में बदल सकते हैं
        </p>
      </div>
    </main>
  );
}

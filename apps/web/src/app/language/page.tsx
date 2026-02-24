'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface LanguageOption {
  code: 'hi' | 'en';
  name: string;
  sub: string;
  flag: string;
  enabled: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳', enabled: true },
  { code: 'en', name: 'English', sub: 'अंग्रेज़ी', flag: '🇬🇧', enabled: true },
];

const COMING_SOON = [
  { name: 'தமிழ்', sub: 'Coming Soon', flag: '🔜' },
  { name: 'తెలుగు', sub: 'Coming Soon', flag: '🔜' },
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
      <div className={styles.container}>
        <span className={styles.namaste}>🙏</span>
        <h1 className={styles.title}>अपनी भाषा चुनें</h1>
        <p className={styles.subtitle}>Choose your preferred language</p>

        <div className={styles.options}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.card} ${selected === lang.code ? styles.cardSelected : ''}`}
              onClick={() => selectLanguage(lang.code)}
            >
              <span className={styles.flag}>{lang.flag}</span>
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
              <span className={styles.flag}>{lang.flag}</span>
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

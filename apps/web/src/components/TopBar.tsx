'use client';

import { useRouter } from 'next/navigation';
import styles from './TopBar.module.css';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  onLanguageToggle?: () => void;
  language?: 'hi' | 'en';
}

export default function TopBar({ showBack, title, onLanguageToggle, language = 'hi' }: TopBarProps) {
  const router = useRouter();

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        {showBack ? (
          <button className={styles.backButton} onClick={() => router.back()} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className={styles.logoMini}>
            <span className={styles.logoSymbol}>&#10048;</span>
            <span className={styles.logoText}>UPAYA</span>
          </div>
        )}
      </div>

      <div className={styles.center}>
        {title && <span className={styles.title}>{title}</span>}
      </div>

      <div className={styles.right}>
        {onLanguageToggle && (
          <button
            className={styles.langToggleButton}
            onClick={onLanguageToggle}
            aria-label="Change language"
          >
            {language === 'hi' ? 'EN' : 'हि'}
          </button>
        )}
      </div>
    </header>
  );
}

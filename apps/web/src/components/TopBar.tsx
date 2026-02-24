'use client';

import { useRouter } from 'next/navigation';
import styles from './TopBar.module.css';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  onLanguageToggle?: () => void;
}

export default function TopBar({ showBack, title, onLanguageToggle }: TopBarProps) {
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
            className={styles.iconButton}
            onClick={onLanguageToggle}
            aria-label="Change language"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
        )}
        <button className={styles.iconButton} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}

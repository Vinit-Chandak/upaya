'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomTabBar.module.css';

interface Tab {
  key: string;
  label: string;
  labelHi: string;
  href: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    key: 'home',
    label: 'Home',
    labelHi: 'Home',
    href: '/home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'remedies',
    label: 'Remedies',
    labelHi: 'Remedies',
    href: '/remedies',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    key: 'explore',
    label: 'Explore',
    labelHi: 'Explore',
    href: '/explore',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    key: 'me',
    label: 'Me',
    labelHi: 'Me',
    href: '/me',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

interface BottomTabBarProps {
  language?: 'hi' | 'en';
}

export default function BottomTabBar({ language = 'hi' }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>
              {language === 'hi' ? tab.labelHi : tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

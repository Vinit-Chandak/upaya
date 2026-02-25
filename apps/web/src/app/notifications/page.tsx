'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

type NotificationType = 'transit_alert' | 'festival_remedy' | 'remedy_reminder' | 'streak_alert' | 'puja_update' | 'prasad_shipping' | 'check_in' | 'dasha_change';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationSettings {
  transitAlerts: boolean;
  remedyReminders: boolean;
  pujaUpdates: boolean;
  streakAlerts: boolean;
  festivalRemedies: boolean;
  checkIns: boolean;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  transit_alert: '\uD83C\uDF0C',
  festival_remedy: '\uD83C\uDF8A',
  remedy_reminder: '\uD83D\uDCFF',
  streak_alert: '\uD83D\uDD25',
  puja_update: '\uD83D\uDED5',
  prasad_shipping: '\uD83D\uDCE6',
  check_in: '\uD83D\uDCAC',
  dasha_change: '\u2728',
};

function getMockNotifications(): NotificationItem[] {
  return [
    {
      id: 'n1', type: 'transit_alert',
      title: 'Saturn Transit Alert', titleHi: '\u0936\u0928\u093F \u0917\u094B\u091A\u0930 \u0905\u0932\u0930\u094D\u091F',
      body: 'Saturn moves into Pisces on Mar 29. Your 7th house will be affected.', bodyHi: '\u0936\u0928\u093F 29 \u092E\u093E\u0930\u094D\u091A \u0915\u094B \u092E\u0940\u0928 \u092E\u0947\u0902 \u092A\u094D\u0930\u0935\u0947\u0936 \u0915\u0930\u0947\u0917\u093E\u0964 \u0906\u092A\u0915\u093E 7\u0935\u093E\u0901 \u092D\u093E\u0935 \u092A\u094D\u0930\u092D\u093E\u0935\u093F\u0924 \u0939\u094B\u0917\u093E\u0964',
      isRead: false, createdAt: '2 hours ago',
    },
    {
      id: 'n2', type: 'remedy_reminder',
      title: 'Mantra Reminder', titleHi: '\u092E\u0902\u0924\u094D\u0930 \u092F\u093E\u0926',
      body: "Don't forget your Mangal Mantra today! Keep the streak going.", bodyHi: '\u0906\u091C \u0905\u092A\u0928\u093E \u092E\u0902\u0917\u0932 \u092E\u0902\u0924\u094D\u0930 \u091C\u092A\u0928\u093E \u0928 \u092D\u0942\u0932\u0947\u0902! Streak \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902\u0964',
      isRead: false, createdAt: '5 hours ago',
    },
    {
      id: 'n3', type: 'puja_update',
      title: 'Puja Completed', titleHi: '\u092A\u0942\u091C\u093E \u092A\u0942\u0930\u0940 \u0939\u0941\u0908',
      body: 'Your Mangal Shanti Puja at Mangalnath, Ujjain is complete. Video available.', bodyHi: '\u0906\u092A\u0915\u0940 \u092E\u0902\u0917\u0932 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E \u092E\u0902\u0917\u0932\u0928\u093E\u0925, \u0909\u091C\u094D\u091C\u0948\u0928 \u092E\u0947\u0902 \u092A\u0942\u0930\u0940 \u0939\u0941\u0908\u0964 \u0935\u0940\u0921\u093F\u092F\u094B \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u0948\u0964',
      isRead: true, createdAt: '1 day ago',
    },
    {
      id: 'n4', type: 'streak_alert',
      title: '7-Day Streak!', titleHi: '7 \u0926\u093F\u0928 \u0915\u0940 Streak!',
      body: "Congratulations! You've completed remedies for 7 consecutive days. +100 Karma Points!", bodyHi: '\u092C\u0927\u093E\u0908! \u0906\u092A\u0928\u0947 \u0932\u0917\u093E\u0924\u093E\u0930 7 \u0926\u093F\u0928 remedies \u092A\u0942\u0930\u0940 \u0915\u0940\u0902\u0964 +100 Karma Points!',
      isRead: true, createdAt: '2 days ago',
    },
    {
      id: 'n5', type: 'prasad_shipping',
      title: 'Prasad Shipped', titleHi: '\u092A\u094D\u0930\u0938\u093E\u0926 \u092D\u0947\u091C \u0926\u093F\u092F\u093E',
      body: 'Your prasad from Mangalnath Temple has been shipped. Expected delivery: Mar 5.', bodyHi: '\u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930 \u0938\u0947 \u092A\u094D\u0930\u0938\u093E\u0926 \u092D\u0947\u091C \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964 \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924 \u0921\u093F\u0932\u0940\u0935\u0930\u0940: 5 \u092E\u093E\u0930\u094D\u091A\u0964',
      isRead: true, createdAt: '3 days ago',
    },
  ];
}

export default function NotificationsPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    transitAlerts: true,
    remedyReminders: true,
    pujaUpdates: true,
    streakAlerts: true,
    festivalRemedies: true,
    checkIns: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setNotifications(getMockNotifications());
  }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsEntries: { key: keyof NotificationSettings; hi: string; en: string }[] = [
    { key: 'transitAlerts', hi: '\u0917\u094D\u0930\u0939 \u0917\u094B\u091A\u0930 \u0905\u0932\u0930\u094D\u091F', en: 'Transit Alerts' },
    { key: 'remedyReminders', hi: '\u0909\u092A\u093E\u092F \u092F\u093E\u0926', en: 'Remedy Reminders' },
    { key: 'pujaUpdates', hi: '\u092A\u0942\u091C\u093E \u0905\u092A\u0921\u0947\u091F', en: 'Puja Updates' },
    { key: 'streakAlerts', hi: 'Streak \u0905\u0932\u0930\u094D\u091F', en: 'Streak Alerts' },
    { key: 'festivalRemedies', hi: '\u0924\u094D\u092F\u094B\u0939\u093E\u0930 \u0909\u092A\u093E\u092F', en: 'Festival Remedies' },
    { key: 'checkIns', hi: 'Check-in \u0938\u0902\u0926\u0947\u0936', en: 'Check-in Messages' },
  ];

  return (
    <div className={styles.appLayout}>
      <TopBar title={t('\u0938\u0942\u091A\u0928\u093E\u090F\u0902', 'Notifications')} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Row */}
          <div className={styles.headerRow}>
            <span className={styles.headerCount}>
              {unreadCount > 0 ? `${unreadCount} ${t('\u0905\u092A\u0920\u093F\u0924', 'unread')}` : t('\u0938\u092C \u092A\u0922\u093C \u0932\u093F\u092F\u093E', 'All read')}
            </span>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button className={styles.markAllBtn} onClick={markAllRead}>
                  {t('\u0938\u092C \u092A\u0922\u093C\u0947\u0902', 'Mark all read')}
                </button>
              )}
              <button
                className={`${styles.settingsBtn} ${showSettings ? styles.settingsBtnActive : ''}`}
                onClick={() => setShowSettings(!showSettings)}
              >
                {'\u2699\uFE0F'}
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className={styles.settingsPanel}>
              <h3 className={styles.settingsTitle}>{t('\u0938\u0942\u091A\u0928\u093E \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938', 'Notification Settings')}</h3>
              {settingsEntries.map((s) => (
                <label key={s.key} className={styles.settingRow}>
                  <span className={styles.settingLabel}>{t(s.hi, s.en)}</span>
                  <button
                    className={`${styles.toggle} ${settings[s.key] ? styles.toggleOn : ''}`}
                    onClick={() => toggleSetting(s.key)}
                    role="switch"
                    aria-checked={settings[s.key]}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </label>
              ))}
            </div>
          )}

          {/* Notification List */}
          <div className={styles.notifList}>
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`${styles.notifCard} ${!n.isRead ? styles.notifCardUnread : ''}`}
                onClick={() => markRead(n.id)}
              >
                <span className={styles.notifIcon}>{TYPE_ICONS[n.type]}</span>
                <div className={styles.notifContent}>
                  <span className={styles.notifTitle}>{t(n.titleHi, n.title)}</span>
                  <span className={styles.notifBody}>{t(n.bodyHi, n.body)}</span>
                  <span className={styles.notifTime}>{n.createdAt}</span>
                </div>
                {!n.isRead && <span className={styles.unreadDot} />}
              </button>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>{'\uD83D\uDD14'}</span>
              <p className={styles.emptyText}>{t('\u0915\u094B\u0908 \u0938\u0942\u091A\u0928\u093E \u0928\u0939\u0940\u0902', 'No notifications')}</p>
            </div>
          )}
        </div>
      </main>
      <BottomTabBar language={language} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

interface NotificationSetting {
  key: string;
  labelHi: string;
  labelEn: string;
  subtitleHi: string;
  subtitleEn: string;
  defaultOn: boolean;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'remedy_reminders',
    labelHi: 'Remedy Reminders',
    labelEn: 'Remedy Reminders',
    subtitleHi: '\u0930\u094B\u091C\u093C\u093E\u0928\u093E \u0905\u092A\u0928\u0947 remedy plan \u0915\u0940 \u092F\u093E\u0926 \u0926\u093F\u0932\u093E\u090F\u0901',
    subtitleEn: 'Daily reminders for your active remedy plan',
    defaultOn: true,
  },
  {
    key: 'transit_alerts',
    labelHi: 'Transit Alerts',
    labelEn: 'Transit Alerts',
    subtitleHi: '\u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0947 transit \u0914\u0930 \u092A\u094D\u0930\u092D\u093E\u0935 \u0915\u0940 \u0938\u0942\u091A\u0928\u093E',
    subtitleEn: 'Get notified about planetary transits affecting you',
    defaultOn: true,
  },
  {
    key: 'festival_remedies',
    labelHi: 'Festival Remedies',
    labelEn: 'Festival Remedies',
    subtitleHi: '\u0924\u094D\u092F\u094B\u0939\u093E\u0930\u094B\u0902 \u092A\u0930 \u0935\u093F\u0936\u0947\u0937 \u0909\u092A\u093E\u092F \u0914\u0930 \u092A\u0942\u091C\u093E',
    subtitleEn: 'Special remedies and pujas for festivals',
    defaultOn: true,
  },
  {
    key: 'puja_updates',
    labelHi: 'Puja Updates',
    labelEn: 'Puja Updates',
    subtitleHi: '\u0906\u092A\u0915\u0940 booked \u092A\u0942\u091C\u093E \u0915\u0940 status updates',
    subtitleEn: 'Status updates for your booked pujas',
    defaultOn: true,
  },
  {
    key: 'promotional',
    labelHi: 'Promotional',
    labelEn: 'Promotional',
    subtitleHi: 'Offers, \u091B\u0942\u091F \u0914\u0930 \u0928\u090F features \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940',
    subtitleEn: 'Offers, discounts, and new feature updates',
    defaultOn: false,
  },
];

export default function SettingsPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [morningTime] = useState('6:30 AM');
  const [eveningTime] = useState('7:00 PM');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);

    // Initialize notification toggles from defaults
    const defaults: Record<string, boolean> = {};
    NOTIFICATION_SETTINGS.forEach((s) => {
      defaults[s.key] = s.defaultOn;
    });
    setNotifications(defaults);
  }, []);

  const handleLanguageChange = (lang: 'hi' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('upaya_language', lang);
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    // Placeholder for logout logic
    if (window.confirm(language === 'hi' ? 'Logout \u0915\u0930\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?' : 'Are you sure you want to logout?')) {
      // Will call Firebase signOut in future
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={language === 'hi' ? 'Settings' : 'Settings'} />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* ========== Language Section ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'Language / \u092D\u093E\u0937\u093E' : 'Language'}
            </h3>
            <div className={styles.sectionCard}>
              <label className={styles.radioItem}>
                <div className={styles.radioInfo}>
                  <span className={styles.radioLabel}>{'\u0939\u093F\u0902\u0926\u0940'}</span>
                  <span className={styles.radioSublabel}>Hindi</span>
                </div>
                <div
                  className={`${styles.radioCircle} ${language === 'hi' ? styles.radioCircleActive : ''}`}
                  onClick={() => handleLanguageChange('hi')}
                  role="radio"
                  aria-checked={language === 'hi'}
                  tabIndex={0}
                >
                  {language === 'hi' && <div className={styles.radioInner} />}
                </div>
              </label>
              <div className={styles.divider} />
              <label className={styles.radioItem}>
                <div className={styles.radioInfo}>
                  <span className={styles.radioLabel}>English</span>
                  <span className={styles.radioSublabel}>{'\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940'}</span>
                </div>
                <div
                  className={`${styles.radioCircle} ${language === 'en' ? styles.radioCircleActive : ''}`}
                  onClick={() => handleLanguageChange('en')}
                  role="radio"
                  aria-checked={language === 'en'}
                  tabIndex={0}
                >
                  {language === 'en' && <div className={styles.radioInner} />}
                </div>
              </label>
            </div>
          </section>

          {/* ========== Notifications Section ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'Notifications' : 'Notifications'}
            </h3>
            <div className={styles.sectionCard}>
              {NOTIFICATION_SETTINGS.map((setting, idx) => (
                <div key={setting.key}>
                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>
                        {language === 'hi' ? setting.labelHi : setting.labelEn}
                      </span>
                      <span className={styles.toggleSubtitle}>
                        {language === 'hi' ? setting.subtitleHi : setting.subtitleEn}
                      </span>
                    </div>
                    <button
                      className={`${styles.toggle} ${notifications[setting.key] ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => toggleNotification(setting.key)}
                      role="switch"
                      aria-checked={!!notifications[setting.key]}
                      aria-label={language === 'hi' ? setting.labelHi : setting.labelEn}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                  {idx < NOTIFICATION_SETTINGS.length - 1 && <div className={styles.divider} />}
                </div>
              ))}
            </div>
          </section>

          {/* ========== Reminder Time Section ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'Reminder Time' : 'Reminder Time'}
            </h3>
            <div className={styles.sectionCard}>
              <div className={styles.timeItem}>
                <div className={styles.timeInfo}>
                  <span className={styles.timeIcon}>{'\uD83C\uDF05'}</span>
                  <span className={styles.timeLabel}>
                    {language === 'hi' ? 'Morning' : 'Morning'}
                  </span>
                </div>
                <span className={styles.timeValue}>{morningTime}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.timeItem}>
                <div className={styles.timeInfo}>
                  <span className={styles.timeIcon}>{'\uD83C\uDF19'}</span>
                  <span className={styles.timeLabel}>
                    {language === 'hi' ? 'Evening' : 'Evening'}
                  </span>
                </div>
                <span className={styles.timeValue}>{eveningTime}</span>
              </div>
            </div>
          </section>

          {/* ========== Privacy Section ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'Privacy & Data' : 'Privacy & Data'}
            </h3>
            <div className={styles.sectionCard}>
              <button className={styles.privacyItem}>
                <span className={styles.privacyLabel}>
                  {language === 'hi' ? 'Delete My Data' : 'Delete My Data'}
                </span>
                <span className={styles.privacyArrow}>{'\u203A'}</span>
              </button>
              <div className={styles.divider} />
              <button className={styles.privacyItem}>
                <span className={styles.privacyLabel}>
                  {language === 'hi' ? 'Download My Data' : 'Download My Data'}
                </span>
                <span className={styles.privacyArrow}>{'\u203A'}</span>
              </button>
              <div className={styles.divider} />
              <div className={styles.privacyItem}>
                <span className={styles.privacyLabel}>
                  {language === 'hi' ? 'Encryption' : 'Encryption'}
                </span>
                <span className={styles.privacyBadge}>
                  ON {'\u2713'}
                </span>
              </div>
            </div>
          </section>

          {/* ========== Support Section ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'Support' : 'Support'}
            </h3>
            <div className={styles.sectionCard}>
              <button className={styles.supportItem}>
                <span className={styles.supportIcon}>{'\uD83D\uDCAC'}</span>
                <span className={styles.supportLabel}>
                  {language === 'hi' ? 'WhatsApp Support' : 'WhatsApp Support'}
                </span>
                <span className={styles.supportArrow}>{'\u203A'}</span>
              </button>
              <div className={styles.divider} />
              <button className={styles.supportItem}>
                <span className={styles.supportIcon}>{'\u2753'}</span>
                <span className={styles.supportLabel}>
                  {language === 'hi' ? 'FAQs' : 'FAQs'}
                </span>
                <span className={styles.supportArrow}>{'\u203A'}</span>
              </button>
              <div className={styles.divider} />
              <button className={styles.supportItem}>
                <span className={styles.supportIcon}>{'\u26A0\uFE0F'}</span>
                <span className={styles.supportLabel}>
                  {language === 'hi' ? 'Report a Problem' : 'Report a Problem'}
                </span>
                <span className={styles.supportArrow}>{'\u203A'}</span>
              </button>
            </div>
          </section>

          {/* ========== App Version ========== */}
          <div className={styles.versionInfo}>
            <p>{language === 'hi' ? 'App Version' : 'App Version'}: 1.0.0</p>
          </div>

          {/* ========== Logout Button ========== */}
          <button className={styles.logoutButton} onClick={handleLogout}>
            {language === 'hi' ? 'Logout' : 'Logout'}
          </button>

          {/* Spacer */}
          <div className={styles.bottomSpacer} />

        </div>
      </main>
    </div>
  );
}

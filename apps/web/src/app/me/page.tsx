'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface UserProfile {
  name: string | null;
  phone: string | null;
  email: string | null;
  language: 'hi' | 'en';
  isLoggedIn: boolean;
}

interface SavedKundli {
  id: string;
  name: string;
  dob: string;
  place: string;
  createdAt: string;
}

interface SavedReport {
  id: string;
  problemType: string;
  doshaName: string;
  status: 'ready' | 'generating';
  createdAt: string;
}

interface OrderSummary {
  id: string;
  pujaName: string;
  pujaNameEn: string;
  templeName: string;
  templeNameEn: string;
  status: string;
  statusLabel: string;
  statusLabelEn: string;
  bookingDate: string;
}

function getMockProfile(): UserProfile {
  return {
    name: null,
    phone: null,
    email: null,
    language: 'hi',
    isLoggedIn: false,
  };
}

function getMockKundlis(language: 'hi' | 'en'): SavedKundli[] {
  return [
    {
      id: 'k1',
      name: language === 'hi' ? '\u092E\u0947\u0930\u0940 \u0915\u0941\u0902\u0921\u0932\u0940' : 'My Kundli',
      dob: '15/03/1995',
      place: 'Lucknow',
      createdAt: '2026-02-24',
    },
  ];
}

function getMockReports(language: 'hi' | 'en'): SavedReport[] {
  return [
    {
      id: 'rp1',
      problemType: 'marriage_delay',
      doshaName: language === 'hi' ? '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937' : 'Mangal Dosha',
      status: 'ready',
      createdAt: '2026-02-24',
    },
  ];
}

function getMockOrders(): OrderSummary[] {
  return [
    {
      id: 'ord1',
      pujaName: 'मंगल दोष निवारण पूजा',
      pujaNameEn: 'Mangal Dosha Nivaran Puja',
      templeName: 'मंगलनाथ मंदिर',
      templeNameEn: 'Mangalnath Temple',
      status: 'confirmed_by_temple',
      statusLabel: 'Confirmed',
      statusLabelEn: 'Confirmed',
      bookingDate: '2026-03-05',
    },
  ];
}

export default function MePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [profile] = useState<UserProfile>(getMockProfile());
  const [kundlis, setKundlis] = useState<SavedKundli[]>([]);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [orders] = useState<OrderSummary[]>(getMockOrders());
  const [referralCode] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setKundlis(getMockKundlis(language));
    setReports(getMockReports(language));
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleLogin = useCallback(() => {
    // Navigate to a chat flow which triggers auth at payment
    router.push('/home');
  }, [router]);

  const handleShare = useCallback(() => {
    const code = referralCode || 'UPAYA';
    const shareText = language === 'hi'
      ? `\u092E\u0947\u0930\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092E\u0947\u0902 \u0926\u094B\u0937 \u092E\u093F\u0932\u093E \u2014 Upaya \u0938\u0947 free \u092E\u0947\u0902 check \u0915\u0930\u094B! Code: ${code} https://upaya.app`
      : `My kundli revealed a dosha \u2014 check yours free on Upaya! Code: ${code} https://upaya.app`;
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  }, [language, referralCode]);

  return (
    <div className={styles.appLayout}>
      <TopBar title={language === 'hi' ? 'Me' : 'Me'} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Profile header */}
          <div className={styles.profileCard}>
            <div className={styles.avatarCircle}>
              <span className={styles.avatarEmoji}>
                {profile.isLoggedIn ? '\uD83D\uDE4F' : '\uD83D\uDC64'}
              </span>
            </div>
            <div className={styles.profileInfo}>
              {profile.isLoggedIn ? (
                <>
                  <h2 className={styles.profileName}>{profile.name || 'User'}</h2>
                  <p className={styles.profileDetail}>{profile.phone || profile.email}</p>
                </>
              ) : (
                <>
                  <h2 className={styles.profileName}>
                    {language === 'hi' ? 'Guest User' : 'Guest User'}
                  </h2>
                  <button className={styles.loginButton} onClick={handleLogin}>
                    {language === 'hi' ? 'Sign In \u0915\u0930\u0947\u0902' : 'Sign In'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* My Kundli Vault */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83D\uDCD6'}</span>
              {language === 'hi' ? 'My Kundli Vault' : 'My Kundli Vault'}
            </h3>

            {kundlis.length === 0 ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyText}>
                  {language === 'hi'
                    ? '\u0905\u092D\u0940 \u0915\u094B\u0908 kundli saved \u0928\u0939\u0940\u0902'
                    : 'No saved kundlis yet'}
                </p>
                <button className={styles.emptyAction} onClick={() => router.push('/chat?problem=get_kundli')}>
                  {language === 'hi' ? 'Free \u0915\u0941\u0902\u0921\u0932\u0940 \u092C\u0928\u0935\u093E\u090F\u0902' : 'Generate Free Kundli'}
                </button>
              </div>
            ) : (
              <div className={styles.cardList}>
                {kundlis.map((k) => (
                  <div key={k.id} className={styles.kundliCard}>
                    <div className={styles.kundliCardLeft}>
                      <span className={styles.kundliIcon}>{'\uD83D\uDD2E'}</span>
                      <div className={styles.kundliInfo}>
                        <span className={styles.kundliName}>{k.name}</span>
                        <span className={styles.kundliMeta}>
                          DOB: {k.dob} &middot; {k.place}
                        </span>
                      </div>
                    </div>
                    <span className={styles.kundliDate}>{k.createdAt}</span>
                  </div>
                ))}
                <button className={styles.addButton} onClick={() => router.push('/chat?problem=get_kundli')}>
                  + {language === 'hi' ? 'Family member \u0915\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u091C\u094B\u0921\u093C\u0947\u0902' : 'Add family member kundli'}
                </button>
              </div>
            )}
          </section>

          {/* My Reports */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83D\uDCC4'}</span>
              {language === 'hi' ? 'My Reports' : 'My Reports'}
            </h3>

            {reports.length === 0 ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyText}>
                  {language === 'hi'
                    ? '\u0905\u092D\u0940 \u0915\u094B\u0908 report \u0928\u0939\u0940\u0902'
                    : 'No reports yet'}
                </p>
              </div>
            ) : (
              <div className={styles.cardList}>
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className={styles.reportCard}
                    onClick={() => router.push(`/chat/report?problem=${r.problemType}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.reportCardLeft}>
                      <span className={styles.reportIcon}>{'\uD83D\uDCC3'}</span>
                      <div className={styles.reportInfo}>
                        <span className={styles.reportName}>{r.doshaName}</span>
                        <span className={styles.reportMeta}>{r.createdAt}</span>
                      </div>
                    </div>
                    <span className={`${styles.reportStatus} ${r.status === 'ready' ? styles.reportStatusReady : styles.reportStatusGenerating}`}>
                      {r.status === 'ready'
                        ? (language === 'hi' ? 'Ready' : 'Ready')
                        : (language === 'hi' ? 'Generating...' : 'Generating...')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Orders (Phase 2) */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'🪔'}</span>
              {language === 'hi' ? 'My Puja Orders' : 'My Puja Orders'}
            </h3>

            {orders.length === 0 ? (
              <div className={styles.emptyCard}>
                <p className={styles.emptyText}>
                  {language === 'hi'
                    ? 'अभी कोई पूजा booking नहीं'
                    : 'No puja bookings yet'}
                </p>
                <button className={styles.emptyAction} onClick={() => router.push('/explore')}>
                  {language === 'hi' ? 'पूजा Book करें' : 'Book a Puja'}
                </button>
              </div>
            ) : (
              <div className={styles.cardList}>
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className={styles.orderCard}
                    onClick={() => router.push(`/orders/${o.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.orderCardLeft}>
                      <span className={styles.orderIcon}>{'🪔'}</span>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderName}>
                          {language === 'hi' ? o.pujaName : o.pujaNameEn}
                        </span>
                        <span className={styles.orderMeta}>
                          {language === 'hi' ? o.templeName : o.templeNameEn} · {new Date(o.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <span className={styles.orderStatus}>
                      {language === 'hi' ? o.statusLabel : o.statusLabelEn}
                    </span>
                  </div>
                ))}
                <button className={styles.viewAllOrders} onClick={() => router.push('/orders')}>
                  {language === 'hi' ? 'सभी Orders देखें →' : 'View All Orders →'}
                </button>
              </div>
            )}
          </section>

          {/* Refer & Earn */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83C\uDF81'}</span>
              {language === 'hi' ? 'Refer & Earn' : 'Refer & Earn'}
            </h3>

            <div className={styles.referralCard}>
              <div className={styles.referralInfo}>
                <p className={styles.referralText}>
                  {language === 'hi'
                    ? '\u0926\u094B\u0938\u094D\u0924\u094B\u0902 \u0915\u094B share \u0915\u0930\u0947\u0902, \u0939\u0930 conversion \u092A\u0930 \u20B950 store credit \u092A\u093E\u090F\u0902!'
                    : 'Share with friends, earn \u20B950 store credit per conversion!'}
                </p>
                {referralCode && (
                  <div className={styles.referralCodeBox}>
                    <span className={styles.referralCodeLabel}>
                      {language === 'hi' ? 'Your Code:' : 'Your Code:'}
                    </span>
                    <span className={styles.referralCodeValue}>{referralCode}</span>
                  </div>
                )}
              </div>
              <button className={styles.shareButton} onClick={handleShare}>
                {'\uD83D\uDCE4'} {language === 'hi' ? 'Share' : 'Share'}
              </button>
            </div>
          </section>

          {/* Settings */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\u2699\uFE0F'}</span>
              {language === 'hi' ? 'Settings' : 'Settings'}
            </h3>

            <div className={styles.settingsList}>
              <button className={styles.settingItem} onClick={toggleLanguage}>
                <span className={styles.settingIcon}>{'\uD83C\uDF10'}</span>
                <span className={styles.settingLabel}>
                  {language === 'hi' ? 'Language' : 'Language'}
                </span>
                <span className={styles.settingValue}>
                  {language === 'hi' ? '\u0939\u093F\u0902\u0926\u0940' : 'English'}
                </span>
                <span className={styles.settingArrow}>{'\u203A'}</span>
              </button>

              <button className={styles.settingItem} onClick={() => setShowSettings(!showSettings)}>
                <span className={styles.settingIcon}>{'\uD83D\uDD14'}</span>
                <span className={styles.settingLabel}>
                  {language === 'hi' ? 'Notifications' : 'Notifications'}
                </span>
                <span className={styles.settingValue}>
                  {language === 'hi' ? 'On' : 'On'}
                </span>
                <span className={styles.settingArrow}>{'\u203A'}</span>
              </button>

              <button className={styles.settingItem}>
                <span className={styles.settingIcon}>{'\uD83D\uDD12'}</span>
                <span className={styles.settingLabel}>
                  {language === 'hi' ? 'Privacy & Data' : 'Privacy & Data'}
                </span>
                <span className={styles.settingArrow}>{'\u203A'}</span>
              </button>

              <button className={styles.settingItem}>
                <span className={styles.settingIcon}>{'\uD83D\uDCAC'}</span>
                <span className={styles.settingLabel}>
                  {language === 'hi' ? 'Help & Support' : 'Help & Support'}
                </span>
                <span className={styles.settingArrow}>{'\u203A'}</span>
              </button>
            </div>
          </section>

          {/* App version */}
          <div className={styles.versionInfo}>
            <p>Upaya v1.0.0</p>
            <p>{language === 'hi' ? '\u20B9199 \u092E\u0947\u0902 complete remedy plan' : 'Complete remedy plan for \u20B9199'}</p>
          </div>

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

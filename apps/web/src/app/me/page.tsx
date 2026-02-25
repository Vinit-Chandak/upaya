'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface UserProfile {
  name: string;
  phone: string;
  email: string | null;
  language: 'hi' | 'en';
  isLoggedIn: boolean;
  memberSince: string;
}

interface KarmaStats {
  karma: number;
  streakDays: number;
}

interface MiniKundli {
  dob: string;
  currentDasha: string;
  currentDashaEn: string;
}

interface SavedReport {
  id: string;
  title: string;
  titleEn: string;
  status: 'ready' | 'generating';
  createdAt: string;
}

interface OrderSummary {
  id: string;
  pujaName: string;
  pujaNameEn: string;
  status: string;
  statusEn: string;
  date: string;
}

function getMockProfile(): UserProfile {
  return {
    name: 'Rahul Sharma',
    phone: '+91 98***-**210',
    email: null,
    language: 'hi',
    isLoggedIn: true,
    memberSince: 'Feb 2026',
  };
}

function getMockKarma(): KarmaStats {
  return { karma: 340, streakDays: 12 };
}

function getMockKundli(): MiniKundli {
  return {
    dob: '15 Mar 1995',
    currentDasha: 'Rahu Mahadasha (2023-2041)',
    currentDashaEn: 'Rahu Mahadasha (2023-2041)',
  };
}

function getMockReports(): SavedReport[] {
  return [
    {
      id: 'rp1',
      title: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 Remedy Report',
      titleEn: 'Mangal Dosha Remedy Report',
      status: 'ready',
      createdAt: '24 Feb 2026',
    },
    {
      id: 'rp2',
      title: '\u0936\u0928\u093F \u0926\u094B\u0937 Analysis',
      titleEn: 'Shani Dosha Analysis',
      status: 'generating',
      createdAt: '25 Feb 2026',
    },
  ];
}

function getMockOrders(): OrderSummary[] {
  return [
    {
      id: 'ord1',
      pujaName: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E',
      pujaNameEn: 'Mangal Dosha Nivaran Puja',
      status: 'Confirmed',
      statusEn: 'Confirmed',
      date: '5 Mar 2026',
    },
  ];
}

export default function MePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [profile] = useState<UserProfile>(getMockProfile());
  const [karma] = useState<KarmaStats>(getMockKarma());
  const [miniKundli] = useState<MiniKundli>(getMockKundli());
  const [reports] = useState<SavedReport[]>(getMockReports());
  const [orders] = useState<OrderSummary[]>(getMockOrders());
  const [referralCode] = useState<string>('RAHUL50');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleShare = useCallback(() => {
    const shareText = language === 'hi'
      ? `\u092E\u0947\u0930\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092E\u0947\u0902 \u0926\u094B\u0937 \u092E\u093F\u0932\u093E \u2014 Upaya \u0938\u0947 free \u092E\u0947\u0902 check \u0915\u0930\u094B! Code: ${referralCode} https://upaya.app`
      : `My kundli revealed a dosha \u2014 check yours free on Upaya! Code: ${referralCode} https://upaya.app`;
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  }, [language, referralCode]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.appLayout}>
      <TopBar title={language === 'hi' ? 'Me' : 'Me'} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* ========== Profile Card ========== */}
          <div className={styles.profileCard}>
            <div className={styles.avatarCircle}>
              {profile.isLoggedIn && profile.name ? (
                <span className={styles.avatarInitials}>{getInitials(profile.name)}</span>
              ) : (
                <span className={styles.avatarEmoji}>{'\uD83D\uDC64'}</span>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>
                {profile.isLoggedIn ? profile.name : (language === 'hi' ? 'Guest User' : 'Guest User')}
              </h2>
              {profile.isLoggedIn && (
                <>
                  <p className={styles.profilePhone}>{profile.phone}</p>
                  <p className={styles.profileMember}>
                    {language === 'hi'
                      ? `Member since ${profile.memberSince}`
                      : `Member since ${profile.memberSince}`}
                  </p>
                </>
              )}
              {!profile.isLoggedIn && (
                <button className={styles.loginButton} onClick={() => router.push('/home')}>
                  {language === 'hi' ? 'Sign In \u0915\u0930\u0947\u0902' : 'Sign In'}
                </button>
              )}
            </div>
          </div>

          {/* ========== Karma + Streak Badges ========== */}
          <div className={styles.badgeRow}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>{'\uD83C\uDFC6'}</span>
              <span className={styles.badgeLabel}>Karma</span>
              <span className={styles.badgeValue}>{karma.karma}</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>{'\uD83D\uDD25'}</span>
              <span className={styles.badgeLabel}>Streak</span>
              <span className={styles.badgeValue}>
                {karma.streakDays} {language === 'hi' ? 'days' : 'days'}
              </span>
            </div>
          </div>

          {/* ========== My Kundli Card ========== */}
          <div className={styles.kundliCard}>
            <div className={styles.kundliCardHeader}>
              <span className={styles.kundliCardIcon}>{'\uD83D\uDCCA'}</span>
              <h3 className={styles.kundliCardTitle}>
                {language === 'hi' ? 'My Kundli' : 'My Kundli'}
              </h3>
            </div>
            <div className={styles.kundliCardBody}>
              <div className={styles.miniChart}>
                {/* Placeholder diamond chart */}
                <div className={styles.miniChartDiamond}>
                  <span className={styles.miniChartLabel}>D1</span>
                </div>
              </div>
              <div className={styles.kundliDetails}>
                <div className={styles.kundliDetailRow}>
                  <span className={styles.kundliDetailLabel}>DOB:</span>
                  <span className={styles.kundliDetailValue}>{miniKundli.dob}</span>
                </div>
                <div className={styles.kundliDetailRow}>
                  <span className={styles.kundliDetailLabel}>
                    {language === 'hi' ? 'Current Dasha:' : 'Current Dasha:'}
                  </span>
                  <span className={styles.kundliDetailValue}>
                    {language === 'hi' ? miniKundli.currentDasha : miniKundli.currentDashaEn}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/me/kundli" className={styles.kundliViewLink}>
              {language === 'hi' ? 'View Full \u2192' : 'View Full \u2192'}
            </Link>
          </div>

          {/* ========== Family Kundli Vault ========== */}
          <div className={styles.familyCard}>
            <div className={styles.familyCardHeader}>
              <span className={styles.familyCardIcon}>{'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66'}</span>
              <h3 className={styles.familyCardTitle}>
                {language === 'hi' ? 'Family Kundli Vault' : 'Family Kundli Vault'}
              </h3>
            </div>
            <div className={styles.familyMembers}>
              <div className={styles.familyMember}>
                <div className={styles.familyMemberAvatar}>
                  <span>{'\uD83D\uDE4F'}</span>
                </div>
                <span className={styles.familyMemberName}>
                  {language === 'hi' ? 'You' : 'You'}
                </span>
              </div>
              <Link href="/me/family" className={styles.familyAddButton}>
                <span className={styles.familyAddIcon}>+</span>
                <span className={styles.familyAddText}>
                  {language === 'hi' ? 'Add Family Member' : 'Add Family Member'}
                </span>
              </Link>
            </div>
          </div>

          {/* ========== My Reports ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83D\uDCDC'}</span>
              {language === 'hi' ? 'My Reports' : 'My Reports'}
            </h3>
            <div className={styles.cardList}>
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/chat/report?id=${r.id}`}
                  className={styles.reportItem}
                >
                  <div className={styles.reportItemLeft}>
                    <span className={styles.reportItemIcon}>{'\uD83D\uDCC3'}</span>
                    <div className={styles.reportItemInfo}>
                      <span className={styles.reportItemTitle}>
                        {language === 'hi' ? r.title : r.titleEn}
                      </span>
                      <span className={styles.reportItemDate}>{r.createdAt}</span>
                    </div>
                  </div>
                  <span className={`${styles.reportItemStatus} ${r.status === 'ready' ? styles.statusReady : styles.statusGenerating}`}>
                    {r.status === 'ready'
                      ? (language === 'hi' ? 'Ready' : 'Ready')
                      : (language === 'hi' ? 'Generating...' : 'Generating...')}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ========== My Orders ========== */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83D\uDCE6'}</span>
              {language === 'hi' ? 'My Orders' : 'My Orders'}
            </h3>
            <div className={styles.cardList}>
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className={styles.orderItem}
                >
                  <div className={styles.orderItemLeft}>
                    <span className={styles.orderItemIcon}>{'\uD83D\uDED2'}</span>
                    <div className={styles.orderItemInfo}>
                      <span className={styles.orderItemTitle}>
                        {language === 'hi' ? o.pujaName : o.pujaNameEn}
                      </span>
                      <span className={styles.orderItemDate}>{o.date}</span>
                    </div>
                  </div>
                  <span className={styles.orderItemStatus}>
                    {language === 'hi' ? o.status : o.statusEn}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ========== Refer & Earn ========== */}
          <div className={styles.referralCard}>
            <div className={styles.referralContent}>
              <div className={styles.referralHeader}>
                <span className={styles.referralIcon}>{'\uD83C\uDF81'}</span>
                <h3 className={styles.referralTitle}>
                  {language === 'hi' ? 'Refer & Earn' : 'Refer & Earn'}
                </h3>
              </div>
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
              {language === 'hi' ? 'Share Now \u2192' : 'Share Now \u2192'}
            </button>
          </div>

          {/* ========== Links Section ========== */}
          <section className={styles.section}>
            <div className={styles.linksList}>
              <Link href="/help" className={styles.linkItem}>
                <span className={styles.linkIcon}>{'\u2753'}</span>
                <span className={styles.linkLabel}>
                  {language === 'hi' ? 'Help & Support' : 'Help & Support'}
                </span>
                <span className={styles.linkArrow}>{'\u203A'}</span>
              </Link>
              <Link href="/about" className={styles.linkItem}>
                <span className={styles.linkIcon}>{'\u2139\uFE0F'}</span>
                <span className={styles.linkLabel}>
                  {language === 'hi' ? 'About Upaya' : 'About Upaya'}
                </span>
                <span className={styles.linkArrow}>{'\u203A'}</span>
              </Link>
              <Link href="/privacy" className={styles.linkItem}>
                <span className={styles.linkIcon}>{'\uD83D\uDD12'}</span>
                <span className={styles.linkLabel}>
                  {language === 'hi' ? 'Privacy Policy' : 'Privacy Policy'}
                </span>
                <span className={styles.linkArrow}>{'\u203A'}</span>
              </Link>
              <Link href="/me/settings" className={styles.linkItem}>
                <span className={styles.linkIcon}>{'\u2699\uFE0F'}</span>
                <span className={styles.linkLabel}>
                  {language === 'hi' ? 'Settings' : 'Settings'}
                </span>
                <span className={styles.linkArrow}>{'\u203A'}</span>
              </Link>
            </div>
          </section>

          {/* ========== App Version ========== */}
          <div className={styles.versionInfo}>
            <p>Upaya v1.0.0</p>
          </div>

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

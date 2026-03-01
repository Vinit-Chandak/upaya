'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

type CmsTab = 'dashboard' | 'bookings' | 'catalog';

interface CmsBooking {
  id: string;
  sankalpName: string;
  pujaName: string;
  pujaNameHi: string;
  bookingDate: string;
  status: string;
  sankalpGotra: string;
  sankalpWish: string;
  hasVideo: boolean;
  amount: number;
}

interface CmsPuja {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  isActive: boolean;
  bookingsThisMonth: number;
}

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
}

const MOCK_BOOKINGS: CmsBooking[] = [
  {
    id: 'b1',
    sankalpName: 'Rohit Kumar',
    pujaName: 'Mangal Dosha Nivaran Puja',
    pujaNameHi: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E',
    bookingDate: '2026-03-05',
    status: 'confirmed_by_temple',
    sankalpGotra: '\u092D\u093E\u0930\u0926\u094D\u0935\u093E\u091C',
    sankalpWish: '\u0936\u093E\u0926\u0940 \u092E\u0947\u0902 \u0906 \u0930\u0939\u0940 \u092C\u093E\u0927\u093E \u0926\u0942\u0930 \u0939\u094B',
    hasVideo: false,
    amount: 2100,
  },
  {
    id: 'b2',
    sankalpName: 'Priya Sharma',
    pujaName: 'Navagraha Shanti Puja',
    pujaNameHi: '\u0928\u0935\u0917\u094D\u0930\u0939 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E',
    bookingDate: '2026-03-06',
    status: 'booked',
    sankalpGotra: '\u0915\u0936\u094D\u092F\u092A',
    sankalpWish: '\u0915\u0930\u093F\u092F\u0930 \u092E\u0947\u0902 \u0924\u0930\u0915\u094D\u0915\u0940 \u0939\u094B',
    hasVideo: false,
    amount: 1800,
  },
  {
    id: 'b3',
    sankalpName: 'Amit Verma',
    pujaName: 'Mangal Dosha Nivaran Puja',
    pujaNameHi: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E',
    bookingDate: '2026-03-02',
    status: 'puja_performed',
    sankalpGotra: '\u0935\u0936\u093F\u0937\u094D\u0920',
    sankalpWish: 'Family peace',
    hasVideo: true,
    amount: 2100,
  },
  {
    id: 'b4',
    sankalpName: 'Sunita Devi',
    pujaName: 'Shani Dosha Nivaran',
    pujaNameHi: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923',
    bookingDate: '2026-02-28',
    status: 'prasad_delivered',
    sankalpGotra: '\u0917\u094C\u0924\u092E',
    sankalpWish: '\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0941\u0927\u093E\u0930',
    hasVideo: true,
    amount: 1500,
  },
];

const MOCK_PUJAS: CmsPuja[] = [
  { id: 'mp1', name: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E', nameEn: 'Mangal Dosha Nivaran Puja', price: 2100, isActive: true, bookingsThisMonth: 12 },
  { id: 'mp2', name: '\u0928\u0935\u0917\u094D\u0930\u0939 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E', nameEn: 'Navagraha Shanti Puja', price: 1800, isActive: true, bookingsThisMonth: 8 },
  { id: 'mp3', name: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923', nameEn: 'Shani Dosha Nivaran', price: 1500, isActive: true, bookingsThisMonth: 5 },
  { id: 'mp4', name: '\u0930\u093E\u0939\u0941 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923', nameEn: 'Rahu Dosha Nivaran', price: 1800, isActive: false, bookingsThisMonth: 0 },
];

const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: 'po1', date: '2026-02-15', amount: 18500, status: 'completed' },
  { id: 'po2', date: '2026-02-01', amount: 15200, status: 'completed' },
  { id: 'po3', date: '2026-01-15', amount: 11300, status: 'completed' },
];

const STATUS_LABELS: Record<string, { label: string; labelHi: string; color: string }> = {
  booked: { label: 'Booked', labelHi: 'Booked', color: 'statusBooked' },
  confirmed_by_temple: { label: 'Confirmed', labelHi: 'Confirmed', color: 'statusConfirmed' },
  puja_performed: { label: 'Puja Done', labelHi: '\u092A\u0942\u091C\u093E \u0938\u092E\u094D\u092A\u0928\u094D\u0928', color: 'statusPujaDone' },
  video_delivered: { label: 'Video Sent', labelHi: 'Video Sent', color: 'statusVideoSent' },
  prasad_shipped: { label: 'Prasad Shipped', labelHi: 'Prasad Shipped', color: 'statusShipped' },
  prasad_delivered: { label: 'Delivered', labelHi: 'Delivered', color: 'statusDelivered' },
};

export default function TempleCmsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isRegistered, setIsRegistered] = useState(true);
  const [activeTab, setActiveTab] = useState<CmsTab>('dashboard');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [pujas, setPujas] = useState(MOCK_PUJAS);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const monthlyEarnings = 45000;
  const bookingsCompleted = 23;
  const avgRating = 4.7;
  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    );
  };

  const handleTogglePuja = (pujaId: string) => {
    setPujas((prev) =>
      prev.map((p) => (p.id === pujaId ? { ...p, isActive: !p.isActive } : p)),
    );
  };

  // ==========================================
  // Registration View (not registered)
  // ==========================================
  if (!isRegistered) {
    return (
      <div className={styles.appLayout}>
        <TopBar showBack title={language === 'hi' ? 'Temple Dashboard' : 'Temple Dashboard'} onLanguageToggle={toggleLanguage} />

        <main className={styles.mainContent}>
          <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.regHero}>
              <Icon name="temple-silhouette" size={48} color="var(--color-accent-gold)" />
              <h1 className={styles.regHeroTitle}>
                {language === 'hi' ? 'Register Your Temple on Upaya' : 'Register Your Temple on Upaya'}
              </h1>
              <p className={styles.regHeroSubtitle}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u093E \u092E\u0902\u0926\u093F\u0930 register \u0915\u0930\u0947\u0902 \u0914\u0930 online bookings \u092A\u093E\u090F\u0902'
                  : 'Register your temple and start receiving online puja bookings'}
              </p>
            </div>

            {/* Step Wizard Preview */}
            <div className={styles.regSteps}>
              <h2 className={styles.regStepsTitle}>
                {language === 'hi' ? 'Registration \u0915\u0947 5 Steps' : '5 Easy Steps to Register'}
              </h2>
              <div className={styles.regStepsList}>
                {[
                  { num: 1, hi: '\u092E\u0902\u0926\u093F\u0930 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940', en: 'Temple Details', iconName: 'temple-silhouette' },
                  { num: 2, hi: '\u092A\u0942\u091C\u093E Catalog', en: 'Puja Catalog', iconName: 'clipboard' },
                  { num: 3, hi: 'Pricing \u0938\u0947\u091F \u0915\u0930\u0947\u0902', en: 'Set Pricing', iconName: 'coin-stack' },
                  { num: 4, hi: 'Photos Upload \u0915\u0930\u0947\u0902', en: 'Upload Photos', iconName: 'video' },
                  { num: 5, hi: 'Review & Go Live', en: 'Go Live', iconName: 'sparkles' },
                ].map((step) => (
                  <div key={step.num} className={styles.regStepItem}>
                    <div className={styles.regStepNumber}>{step.num}</div>
                    <div className={styles.regStepInfo}>
                      <Icon name={step.iconName} size={20} color="var(--color-accent-gold)" />
                      <span className={styles.regStepLabel}>
                        {language === 'hi' ? step.hi : step.en}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 Preview Form */}
            <div className={styles.regFormPreview}>
              <h3 className={styles.regFormTitle}>
                {language === 'hi' ? 'Step 1: \u092E\u0902\u0926\u093F\u0930 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940' : 'Step 1: Temple Details'}
              </h3>
              <div className={styles.regFormFields}>
                <div className={styles.regFormGroup}>
                  <label className={styles.regLabel}>
                    {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930 \u0915\u093E \u0928\u093E\u092E' : 'Temple Name'}
                  </label>
                  <input
                    type="text"
                    className={styles.regInput}
                    placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u0936\u094D\u0930\u0940 \u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930' : 'e.g. Shri Mangalnath Temple'}
                    readOnly
                  />
                </div>
                <div className={styles.regFormRow}>
                  <div className={styles.regFormGroup}>
                    <label className={styles.regLabel}>
                      {language === 'hi' ? '\u0936\u0939\u0930' : 'City'}
                    </label>
                    <input type="text" className={styles.regInput} placeholder="Ujjain" readOnly />
                  </div>
                  <div className={styles.regFormGroup}>
                    <label className={styles.regLabel}>
                      {language === 'hi' ? '\u0930\u093E\u091C\u094D\u092F' : 'State'}
                    </label>
                    <input type="text" className={styles.regInput} placeholder="Madhya Pradesh" readOnly />
                  </div>
                </div>
                <div className={styles.regFormGroup}>
                  <label className={styles.regLabel}>
                    {language === 'hi' ? '\u092A\u094D\u0930\u092E\u0941\u0916 \u0926\u0947\u0935\u0924\u093E' : 'Primary Deity'}
                  </label>
                  <input type="text" className={styles.regInput} placeholder={language === 'hi' ? '\u0936\u094D\u0930\u0940 \u092E\u0902\u0917\u0932\u0928\u093E\u0925' : 'Lord Mangalnath'} readOnly />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.regCtaSection}>
              <button
                className={styles.regCtaPrimary}
                onClick={() => router.push('/temple-cms/register')}
              >
                {language === 'hi' ? 'Registration \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902' : 'Start Registration'}
              </button>
              <button
                className={styles.regCtaSecondary}
                onClick={() => setIsRegistered(true)}
              >
                {language === 'hi' ? 'Demo Dashboard \u0926\u0947\u0916\u0947\u0902' : 'View Demo Dashboard'}
              </button>
            </div>

            {/* Benefits */}
            <div className={styles.regBenefits}>
              <h3 className={styles.regBenefitsTitle}>
                {language === 'hi' ? 'Upaya \u092A\u0930 \u0915\u094D\u092F\u094B\u0902?' : 'Why Upaya?'}
              </h3>
              <div className={styles.regBenefitsList}>
                {[
                  { iconName: 'coin-stack', hi: '70% revenue \u0906\u092A\u0915\u093E, 30% platform fee', en: '70% revenue yours, 30% platform fee' },
                  { iconName: 'users', hi: '\u0932\u093E\u0916\u094B\u0902 users \u0924\u0915 \u092A\u0939\u0941\u0901\u091A', en: 'Reach millions of devotees' },
                  { iconName: 'bell', hi: 'Real-time booking notifications', en: 'Real-time booking notifications' },
                  { iconName: 'bar-chart', hi: 'Analytics \u0914\u0930 revenue tracking', en: 'Analytics and revenue tracking' },
                ].map((benefit, i) => (
                  <div key={i} className={styles.regBenefitItem}>
                    <Icon name={benefit.iconName} size={20} color="var(--color-accent-gold)" />
                    <span className={styles.regBenefitText}>
                      {language === 'hi' ? benefit.hi : benefit.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // Dashboard View (registered)
  // ==========================================
  return (
    <div className={styles.appLayout}>
      {/* CMS Header */}
      <header className={styles.cmsHeader}>
        <div className={styles.cmsHeaderInner}>
          <div className={styles.cmsLogo}>
            <Icon name="temple-silhouette" size={24} color="var(--color-accent-gold)" />
            <div className={styles.cmsLogoText}>
              <span className={styles.cmsLogoTitle}>
                {language === 'hi' ? '\u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930' : 'Mangalnath Temple'}
              </span>
              <span className={styles.cmsLogoSubtitle}>Temple Dashboard</span>
            </div>
          </div>
          <button className={styles.langToggle} onClick={toggleLanguage}>
            {language === 'hi' ? 'EN' : '\u0939\u093F'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <div className={styles.tabNavInner}>
          {(['dashboard', 'bookings', 'catalog'] as CmsTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dashboard'
                ? 'Dashboard'
                : tab === 'bookings'
                  ? 'Bookings'
                  : (language === 'hi' ? '\u092A\u0942\u091C\u093E Catalog' : 'Puja Catalog')}
            </button>
          ))}
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* ============ Dashboard Tab ============ */}
          {activeTab === 'dashboard' && (
            <div className={styles.dashContent}>
              {/* Revenue Summary Cards */}
              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                  <Icon name="coin-stack" size={24} color="var(--color-accent-gold)" />
                  <span className={styles.statValue}>₹{monthlyEarnings.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'Monthly Earnings' : 'Monthly Earnings'}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <Icon name="clipboard" size={24} color="var(--color-accent-gold)" />
                  <span className={styles.statValue}>{bookingsCompleted}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'Bookings Completed' : 'Bookings Completed'}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <Icon name="star-rating" size={24} color="var(--color-accent-gold)" />
                  <span className={styles.statValue}>{avgRating}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'Average Rating' : 'Average Rating'}
                  </span>
                </div>
              </div>

              {/* Puja Catalog Management */}
              <div className={styles.dashSection}>
                <div className={styles.dashSectionHeader}>
                  <h2 className={styles.dashSectionTitle}>
                    {language === 'hi' ? '\u092A\u0942\u091C\u093E Catalog' : 'Puja Catalog'}
                  </h2>
                  <button className={styles.addButton}>
                    + {language === 'hi' ? '\u0928\u0908 \u092A\u0942\u091C\u093E' : 'Add Puja'}
                  </button>
                </div>
                <div className={styles.pujaManageList}>
                  {pujas.map((puja) => (
                    <div key={puja.id} className={styles.pujaManageCard}>
                      <div className={styles.pujaManageLeft}>
                        <Icon name="diya" size={20} color="var(--color-accent-gold)" />
                        <div className={styles.pujaManageInfo}>
                          <span className={styles.pujaManageName}>
                            {language === 'hi' ? puja.name : puja.nameEn}
                          </span>
                          <span className={styles.pujaManageMeta}>
                            ₹{puja.price.toLocaleString('en-IN')} · {puja.bookingsThisMonth} {language === 'hi' ? 'bookings this month' : 'bookings this month'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.pujaManageRight}>
                        <button
                          className={`${styles.toggleButton} ${puja.isActive ? styles.toggleActive : styles.toggleInactive}`}
                          onClick={() => handleTogglePuja(puja.id)}
                        >
                          {puja.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button className={styles.editBtn}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className={styles.dashSection}>
                <h2 className={styles.dashSectionTitle}>
                  {language === 'hi' ? 'Recent Bookings' : 'Recent Bookings'}
                </h2>
                <div className={styles.recentBookingsList}>
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className={styles.recentBookingCard}>
                      <div className={styles.recentBookingLeft}>
                        <span className={styles.recentBookingName}>{b.sankalpName}</span>
                        <span className={styles.recentBookingPuja}>
                          {language === 'hi' ? b.pujaNameHi : b.pujaName}
                        </span>
                        <span className={styles.recentBookingDate}>
                          {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className={styles.recentBookingRight}>
                        <span className={`${styles.bookingStatus} ${styles[STATUS_LABELS[b.status]?.color || 'statusBooked']}`}>
                          {language === 'hi'
                            ? STATUS_LABELS[b.status]?.labelHi || b.status
                            : STATUS_LABELS[b.status]?.label || b.status}
                        </span>
                        <span className={styles.recentBookingAmount}>₹{b.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout History */}
              <div className={styles.dashSection}>
                <h2 className={styles.dashSectionTitle}>
                  {language === 'hi' ? 'Payout History' : 'Payout History'}
                </h2>
                <div className={styles.payoutList}>
                  {MOCK_PAYOUTS.map((payout) => (
                    <div key={payout.id} className={styles.payoutCard}>
                      <div className={styles.payoutLeft}>
                        <span className={styles.payoutDate}>
                          {new Date(payout.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className={styles.payoutRight}>
                        <span className={styles.payoutAmount}>₹{payout.amount.toLocaleString('en-IN')}</span>
                        <span className={`${styles.payoutStatus} ${styles[`payout${payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}`]}`}>
                          {payout.status === 'completed'
                            ? (language === 'hi' ? 'Completed' : 'Completed')
                            : payout.status === 'processing'
                              ? (language === 'hi' ? 'Processing' : 'Processing')
                              : (language === 'hi' ? 'Pending' : 'Pending')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refer Another Temple Card */}
              <div className={styles.referCard}>
                <div className={styles.referCardInner}>
                  <Icon name="temple-silhouette" size={24} color="var(--color-accent-gold)" />
                  <div className={styles.referInfo}>
                    <h3 className={styles.referTitle}>
                      {language === 'hi' ? '\u090F\u0915 \u0914\u0930 \u092E\u0902\u0926\u093F\u0930 Refer \u0915\u0930\u0947\u0902' : 'Refer Another Temple'}
                    </h3>
                    <p className={styles.referDesc}>
                      {language === 'hi'
                        ? '₹500 per referred temple that goes live'
                        : '₹500 per referred temple that goes live'}
                    </p>
                  </div>
                </div>
                <button className={styles.referButton}>
                  {language === 'hi' ? 'Refer \u0915\u0930\u0947\u0902' : 'Refer Now'}
                </button>
              </div>

              {/* Switch to Registration View (for demo) */}
              <button
                className={styles.switchViewButton}
                onClick={() => setIsRegistered(false)}
              >
                {language === 'hi' ? 'Registration View \u0926\u0947\u0916\u0947\u0902' : 'View Registration Page'}
              </button>
            </div>
          )}

          {/* ============ Bookings Tab ============ */}
          {activeTab === 'bookings' && (
            <div className={styles.bookingsContent}>
              {bookings.map((b) => (
                <div key={b.id} className={styles.bookingCard}>
                  <button
                    className={styles.bookingCardHeader}
                    onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                  >
                    <div className={styles.bookingCardLeft}>
                      <span className={styles.bookingName}>{b.sankalpName}</span>
                      <span className={styles.bookingPuja}>
                        {language === 'hi' ? b.pujaNameHi : b.pujaName}
                      </span>
                      <span className={styles.bookingDate}>
                        {new Date(b.bookingDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className={`${styles.bookingStatus} ${styles[STATUS_LABELS[b.status]?.color || 'statusBooked']}`}>
                      {STATUS_LABELS[b.status]?.label || b.status}
                    </span>
                  </button>

                  {expandedBooking === b.id && (
                    <div className={styles.bookingExpanded}>
                      <div className={styles.sankalpSection}>
                        <h4 className={styles.sankalpTitle}>
                          {language === 'hi' ? '\u0938\u0902\u0915\u0932\u094D\u092A Details' : 'Sankalp Details'}
                        </h4>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? '\u0928\u093E\u092E' : 'Name'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpName}</span>
                        </div>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? '\u0917\u094B\u0924\u094D\u0930' : 'Gotra'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpGotra || '\u2014'}</span>
                        </div>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? '\u0907\u091A\u094D\u091B\u093E' : 'Wish'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpWish}</span>
                        </div>
                      </div>

                      <div className={styles.bookingActions}>
                        {b.status === 'booked' && (
                          <button
                            className={styles.actionButtonPrimary}
                            onClick={() => handleStatusUpdate(b.id, 'confirmed_by_temple')}
                          >
                            {language === 'hi' ? 'Booking Confirm \u0915\u0930\u0947\u0902' : 'Confirm Booking'}
                          </button>
                        )}
                        {b.status === 'confirmed_by_temple' && (
                          <button
                            className={styles.actionButtonPrimary}
                            onClick={() => handleStatusUpdate(b.id, 'puja_performed')}
                          >
                            {language === 'hi' ? '\u092A\u0942\u091C\u093E \u0938\u092E\u094D\u092A\u0928\u094D\u0928 Mark \u0915\u0930\u0947\u0902' : 'Mark Puja Performed'}
                          </button>
                        )}
                        {b.status === 'puja_performed' && !b.hasVideo && (
                          <button className={styles.actionButtonPrimary}>
                            {language === 'hi' ? 'Video Upload \u0915\u0930\u0947\u0902' : 'Upload Video'}
                          </button>
                        )}
                        {b.status === 'puja_performed' && b.hasVideo && (
                          <button
                            className={styles.actionButtonPrimary}
                            onClick={() => handleStatusUpdate(b.id, 'video_delivered')}
                          >
                            {language === 'hi' ? 'Video Deliver \u0915\u0930\u0947\u0902' : 'Deliver Video'}
                          </button>
                        )}
                        {b.status === 'video_delivered' && (
                          <div className={styles.trackingForm}>
                            <input
                              type="text"
                              className={styles.trackingInput}
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder={language === 'hi' ? 'Tracking number \u0921\u093E\u0932\u0947\u0902' : 'Enter tracking number'}
                            />
                            <button
                              className={styles.actionButtonPrimary}
                              onClick={() => {
                                if (trackingInput.trim()) {
                                  handleStatusUpdate(b.id, 'prasad_shipped');
                                  setTrackingInput('');
                                }
                              }}
                            >
                              {language === 'hi' ? '\u092A\u094D\u0930\u0938\u093E\u0926 Dispatch \u0915\u0930\u0947\u0902' : 'Dispatch Prasad'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ============ Catalog Tab ============ */}
          {activeTab === 'catalog' && (
            <div className={styles.catalogContent}>
              <div className={styles.catalogHeader}>
                <h2 className={styles.catalogTitle}>
                  {language === 'hi' ? '\u092A\u0942\u091C\u093E Catalog' : 'Puja Catalog'}
                </h2>
                <button className={styles.addPujaButton}>
                  + {language === 'hi' ? '\u0928\u0908 \u092A\u0942\u091C\u093E \u091C\u094B\u0921\u093C\u0947\u0902' : 'Add Puja'}
                </button>
              </div>

              <div className={styles.catalogList}>
                {pujas.map((puja) => (
                  <div key={puja.id} className={styles.catalogCard}>
                    <div className={styles.catalogCardLeft}>
                      <Icon name="diya" size={20} color="var(--color-accent-gold)" />
                      <div className={styles.catalogInfo}>
                        <span className={styles.catalogName}>
                          {language === 'hi' ? puja.name : puja.nameEn}
                        </span>
                        <span className={styles.catalogMeta}>
                          ₹{puja.price.toLocaleString('en-IN')} · {puja.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.catalogActions}>
                      <button
                        className={`${styles.toggleButton} ${puja.isActive ? styles.toggleActive : styles.toggleInactive}`}
                        onClick={() => handleTogglePuja(puja.id)}
                      >
                        {puja.isActive ? 'ON' : 'OFF'}
                      </button>
                      <button className={styles.editButton}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

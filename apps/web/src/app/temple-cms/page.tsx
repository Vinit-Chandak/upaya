'use client';

import { useState, useEffect } from 'react';
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
}

const MOCK_BOOKINGS: CmsBooking[] = [
  {
    id: 'b1',
    sankalpName: 'Rohit Kumar',
    pujaName: 'Mangal Dosha Nivaran Puja',
    pujaNameHi: 'मंगल दोष निवारण पूजा',
    bookingDate: '2026-03-05',
    status: 'confirmed_by_temple',
    sankalpGotra: 'भारद्वाज',
    sankalpWish: 'शादी में आ रही बाधा दूर हो',
    hasVideo: false,
  },
  {
    id: 'b2',
    sankalpName: 'Priya Sharma',
    pujaName: 'Navagraha Shanti Puja',
    pujaNameHi: 'नवग्रह शांति पूजा',
    bookingDate: '2026-03-06',
    status: 'booked',
    sankalpGotra: 'कश्यप',
    sankalpWish: 'करियर में तरक्की हो',
    hasVideo: false,
  },
  {
    id: 'b3',
    sankalpName: 'Amit Verma',
    pujaName: 'Mangal Dosha Nivaran Puja',
    pujaNameHi: 'मंगल दोष निवारण पूजा',
    bookingDate: '2026-03-02',
    status: 'puja_performed',
    sankalpGotra: 'वशिष्ठ',
    sankalpWish: 'Family peace',
    hasVideo: true,
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  booked: { label: 'Booked', color: 'statusBooked' },
  confirmed_by_temple: { label: 'Confirmed', color: 'statusConfirmed' },
  puja_performed: { label: 'Puja Done', color: 'statusPujaDone' },
  video_delivered: { label: 'Video Sent', color: 'statusVideoSent' },
  prasad_shipped: { label: 'Prasad Shipped', color: 'statusShipped' },
  prasad_delivered: { label: 'Delivered', color: 'statusDelivered' },
};

export default function TempleCmsPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<CmsTab>('dashboard');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const todayBookings = bookings.filter((b) => b.bookingDate === new Date().toISOString().split('T')[0]);
  const upcomingBookings = bookings.filter((b) => b.bookingDate > new Date().toISOString().split('T')[0]);
  const totalRevenue = bookings.length * 2100 * 0.7;

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    );
  };

  return (
    <div className={styles.appLayout}>
      {/* CMS Header */}
      <header className={styles.cmsHeader}>
        <div className={styles.cmsHeaderInner}>
          <div className={styles.cmsLogo}>
            <span className={styles.cmsLogoIcon}>🛕</span>
            <div className={styles.cmsLogoText}>
              <span className={styles.cmsLogoTitle}>
                {language === 'hi' ? 'मंगलनाथ मंदिर' : 'Mangalnath Temple'}
              </span>
              <span className={styles.cmsLogoSubtitle}>Temple Dashboard</span>
            </div>
          </div>
          <button
            className={styles.langToggle}
            onClick={() => {
              const newLang = language === 'hi' ? 'en' : 'hi';
              setLanguage(newLang);
              localStorage.setItem('upaya_language', newLang);
            }}
          >
            {language === 'hi' ? 'EN' : 'हि'}
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
                ? (language === 'hi' ? 'Dashboard' : 'Dashboard')
                : tab === 'bookings'
                  ? (language === 'hi' ? 'Bookings' : 'Bookings')
                  : (language === 'hi' ? 'पूजा Catalog' : 'Puja Catalog')}
            </button>
          ))}
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className={styles.dashContent}>
              {/* Stats cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>📋</span>
                  <span className={styles.statValue}>{bookings.length}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'कुल Bookings' : 'Total Bookings'}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>💰</span>
                  <span className={styles.statValue}>₹{totalRevenue.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'कुल Revenue' : 'Total Revenue'}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>📅</span>
                  <span className={styles.statValue}>{todayBookings.length}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'आज की Bookings' : "Today's Bookings"}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>🔜</span>
                  <span className={styles.statValue}>{upcomingBookings.length}</span>
                  <span className={styles.statLabel}>
                    {language === 'hi' ? 'आने वाली' : 'Upcoming'}
                  </span>
                </div>
              </div>

              {/* Quick actions for today */}
              <div className={styles.quickSection}>
                <h2 className={styles.quickTitle}>
                  {language === 'hi' ? 'आने वाली Bookings' : 'Upcoming Bookings'}
                </h2>
                {bookings
                  .filter((b) => ['booked', 'confirmed_by_temple'].includes(b.status))
                  .map((b) => (
                    <div key={b.id} className={styles.quickCard}>
                      <div className={styles.quickCardHeader}>
                        <div>
                          <span className={styles.quickName}>{b.sankalpName}</span>
                          <span className={styles.quickPuja}>
                            {language === 'hi' ? b.pujaNameHi : b.pujaName}
                          </span>
                        </div>
                        <span className={styles.quickDate}>
                          {new Date(b.bookingDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className={styles.quickActions}>
                        {b.status === 'booked' && (
                          <button
                            className={styles.actionButton}
                            onClick={() => handleStatusUpdate(b.id, 'confirmed_by_temple')}
                          >
                            ✅ {language === 'hi' ? 'Confirm करें' : 'Confirm'}
                          </button>
                        )}
                        {b.status === 'confirmed_by_temple' && (
                          <button
                            className={styles.actionButton}
                            onClick={() => handleStatusUpdate(b.id, 'puja_performed')}
                          >
                            🪔 {language === 'hi' ? 'पूजा सम्पन्न' : 'Mark Puja Done'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
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
                      {/* Sankalp details */}
                      <div className={styles.sankalpSection}>
                        <h4 className={styles.sankalpTitle}>
                          {language === 'hi' ? 'संकल्प Details' : 'Sankalp Details'}
                        </h4>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? 'नाम' : 'Name'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpName}</span>
                        </div>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? 'गोत्र' : 'Gotra'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpGotra || '—'}</span>
                        </div>
                        <div className={styles.sankalpRow}>
                          <span className={styles.sankalpLabel}>{language === 'hi' ? 'इच्छा' : 'Wish'}:</span>
                          <span className={styles.sankalpValue}>{b.sankalpWish}</span>
                        </div>
                      </div>

                      {/* Action buttons based on status */}
                      <div className={styles.bookingActions}>
                        {b.status === 'booked' && (
                          <button
                            className={styles.actionButtonPrimary}
                            onClick={() => handleStatusUpdate(b.id, 'confirmed_by_temple')}
                          >
                            ✅ {language === 'hi' ? 'Booking Confirm करें' : 'Confirm Booking'}
                          </button>
                        )}
                        {b.status === 'confirmed_by_temple' && (
                          <button
                            className={styles.actionButtonPrimary}
                            onClick={() => handleStatusUpdate(b.id, 'puja_performed')}
                          >
                            🪔 {language === 'hi' ? 'पूजा सम्पन्न Mark करें' : 'Mark Puja Performed'}
                          </button>
                        )}
                        {b.status === 'puja_performed' && !b.hasVideo && (
                          <button className={styles.actionButtonPrimary}>
                            🎥 {language === 'hi' ? 'Video Upload करें' : 'Upload Video'}
                          </button>
                        )}
                        {b.status === 'puja_performed' && b.hasVideo && (
                          <>
                            <button
                              className={styles.actionButtonPrimary}
                              onClick={() => handleStatusUpdate(b.id, 'video_delivered')}
                            >
                              📤 {language === 'hi' ? 'Video Deliver करें' : 'Deliver Video'}
                            </button>
                          </>
                        )}
                        {b.status === 'video_delivered' && (
                          <div className={styles.trackingForm}>
                            <input
                              type="text"
                              className={styles.trackingInput}
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder={language === 'hi' ? 'Tracking number डालें' : 'Enter tracking number'}
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
                              📦 {language === 'hi' ? 'प्रसाद Dispatch करें' : 'Dispatch Prasad'}
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

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className={styles.catalogContent}>
              <div className={styles.catalogHeader}>
                <h2 className={styles.catalogTitle}>
                  {language === 'hi' ? 'पूजा Catalog' : 'Puja Catalog'}
                </h2>
                <button className={styles.addPujaButton}>
                  + {language === 'hi' ? 'नई पूजा जोड़ें' : 'Add Puja'}
                </button>
              </div>

              <div className={styles.catalogList}>
                <div className={styles.catalogCard}>
                  <div className={styles.catalogCardLeft}>
                    <span className={styles.catalogEmoji}>🪔</span>
                    <div className={styles.catalogInfo}>
                      <span className={styles.catalogName}>
                        {language === 'hi' ? 'मंगल दोष निवारण पूजा' : 'Mangal Dosha Nivaran Puja'}
                      </span>
                      <span className={styles.catalogMeta}>₹2,100 · Active</span>
                    </div>
                  </div>
                  <button className={styles.editButton}>
                    {language === 'hi' ? 'Edit' : 'Edit'}
                  </button>
                </div>

                <div className={styles.catalogCard}>
                  <div className={styles.catalogCardLeft}>
                    <span className={styles.catalogEmoji}>🪔</span>
                    <div className={styles.catalogInfo}>
                      <span className={styles.catalogName}>
                        {language === 'hi' ? 'नवग्रह शांति पूजा' : 'Navagraha Shanti Puja'}
                      </span>
                      <span className={styles.catalogMeta}>₹1,800 · Active</span>
                    </div>
                  </div>
                  <button className={styles.editButton}>
                    {language === 'hi' ? 'Edit' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

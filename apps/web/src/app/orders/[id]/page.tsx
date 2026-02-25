'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';
import type { BookingStatus } from '@upaya/shared';

const BOOKING_STATUS_ORDER: BookingStatus[] = [
  'booked',
  'confirmed_by_temple',
  'puja_performed',
  'video_delivered',
  'prasad_shipped',
  'prasad_delivered',
  'protocol_complete',
];

const STATUS_LABELS: Record<BookingStatus, { hi: string; en: string; icon: string }> = {
  booked: { hi: 'Booked', en: 'Booked', icon: '📝' },
  confirmed_by_temple: { hi: 'Temple ने Confirm किया', en: 'Confirmed by Temple', icon: '✅' },
  puja_performed: { hi: 'पूजा सम्पन्न', en: 'Puja Performed', icon: '🪔' },
  video_delivered: { hi: 'Video Delivered', en: 'Video Delivered', icon: '🎥' },
  prasad_shipped: { hi: 'प्रसाद Shipped', en: 'Prasad Shipped', icon: '📦' },
  prasad_delivered: { hi: 'प्रसाद Delivered', en: 'Prasad Delivered', icon: '🏠' },
  protocol_complete: { hi: 'Protocol Complete', en: 'Protocol Complete', icon: '🙏' },
};

interface MockOrder {
  id: string;
  pujaName: string;
  pujaNameHi: string;
  templeName: string;
  templeNameHi: string;
  templeCity: string;
  bookingDate: string;
  status: BookingStatus;
  sankalpName: string;
  price: number;
  hasVideo: boolean;
  videoUrl: string | null;
  hasCertificate: boolean;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  statusTimeline: { status: BookingStatus; date: string }[];
}

const MOCK_ORDER: MockOrder = {
  id: 'ord-1',
  pujaName: 'Mangal Dosha Nivaran Puja',
  pujaNameHi: 'मंगल दोष निवारण पूजा',
  templeName: 'Mangalnath Temple',
  templeNameHi: 'मंगलनाथ मंदिर',
  templeCity: 'Ujjain',
  bookingDate: '2026-03-05',
  status: 'video_delivered',
  sankalpName: 'Rohit Kumar',
  price: 2100,
  hasVideo: true,
  videoUrl: '#',
  hasCertificate: true,
  trackingNumber: 'DTDC123456789',
  estimatedDelivery: '2026-03-18',
  statusTimeline: [
    { status: 'booked', date: '25 Feb 2026' },
    { status: 'confirmed_by_temple', date: '26 Feb 2026' },
    { status: 'puja_performed', date: '5 Mar 2026' },
    { status: 'video_delivered', date: '8 Mar 2026' },
  ],
};

export default function OrderDetailPage() {
  const params = useParams();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [order] = useState<MockOrder>(MOCK_ORDER);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const currentStatusIndex = BOOKING_STATUS_ORDER.indexOf(order.status);

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'Order Tracking' : 'Order Tracking'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Order header */}
          <div className={styles.orderHeader}>
            <div className={styles.orderHeaderLeft}>
              <h1 className={styles.pujaName}>
                {language === 'hi' ? order.pujaNameHi : order.pujaName}
              </h1>
              <p className={styles.templeName}>
                {language === 'hi' ? order.templeNameHi : order.templeName}, {order.templeCity}
              </p>
            </div>
            <span className={styles.orderIdBadge}>#{(params.id as string)?.slice(-6) || order.id}</span>
          </div>

          {/* Status Timeline */}
          <div className={styles.timelineCard}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? 'Status Timeline:' : 'Status Timeline:'}
            </h2>
            <div className={styles.timeline}>
              {BOOKING_STATUS_ORDER.map((status, index) => {
                const timelineEntry = order.statusTimeline.find((t) => t.status === status);
                const isDone = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className={styles.timelineItem}>
                    <div className={styles.timelineLine}>
                      <div
                        className={`${styles.timelineDot} ${isDone ? styles.timelineDotDone : ''} ${isCurrent ? styles.timelineDotCurrent : ''}`}
                      >
                        {isDone && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                      {index < BOOKING_STATUS_ORDER.length - 1 && (
                        <div className={`${styles.timelineConnector} ${isDone && index < currentStatusIndex ? styles.timelineConnectorDone : ''}`} />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineRow}>
                        <span className={styles.timelineIcon}>{STATUS_LABELS[status].icon}</span>
                        <span className={`${styles.timelineLabel} ${isDone ? styles.timelineLabelDone : ''}`}>
                          {language === 'hi' ? STATUS_LABELS[status].hi : STATUS_LABELS[status].en}
                        </span>
                      </div>
                      {timelineEntry && (
                        <span className={styles.timelineDate}>{timelineEntry.date}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video section */}
          {order.hasVideo && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {language === 'hi' ? 'पूजा Video:' : 'Puja Video:'}
              </h2>
              <div className={styles.videoCard}>
                <div className={styles.videoPlaceholder}>
                  <span className={styles.videoPlayIcon}>▶</span>
                </div>
                <div className={styles.videoActions}>
                  <button className={styles.videoButton}>
                    {language === 'hi' ? 'Video देखें' : 'Watch Video'}
                  </button>
                  <button className={styles.videoButtonSecondary}>
                    {language === 'hi' ? 'Download' : 'Download'}
                  </button>
                  <button className={styles.videoButtonSecondary}>
                    {language === 'hi' ? 'WhatsApp पर Share' : 'Share on WhatsApp'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certificate section */}
          {order.hasCertificate && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {language === 'hi' ? 'Digital Certificate:' : 'Digital Certificate:'}
              </h2>
              <div className={styles.certificateCard}>
                <div className={styles.certificateHeader}>
                  <span className={styles.certificateIcon}>📜</span>
                  <div className={styles.certificateInfo}>
                    <span className={styles.certificateTitle}>
                      {language === 'hi' ? 'पूजा Completion Certificate' : 'Certificate of Puja Completion'}
                    </span>
                    <span className={styles.certificateSubtitle}>
                      {language === 'hi'
                        ? `${order.pujaNameHi} — ${order.sankalpName}`
                        : `${order.pujaName} — ${order.sankalpName}`}
                    </span>
                  </div>
                </div>
                <button className={styles.certificateButton}>
                  {language === 'hi' ? 'Certificate Download करें' : 'Download Certificate'}
                </button>
              </div>
            </div>
          )}

          {/* Shipping / Tracking section */}
          {order.trackingNumber && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {language === 'hi' ? 'प्रसाद Shipping:' : 'Prasad Shipping:'}
              </h2>
              <div className={styles.shippingCard}>
                <div className={styles.shippingRow}>
                  <span className={styles.shippingLabel}>
                    {language === 'hi' ? 'Tracking:' : 'Tracking:'}
                  </span>
                  <span className={styles.trackingNumber}>{order.trackingNumber}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className={styles.shippingRow}>
                    <span className={styles.shippingLabel}>
                      {language === 'hi' ? 'Expected delivery:' : 'Expected delivery:'}
                    </span>
                    <span className={styles.shippingValue}>
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <button className={styles.trackButton}>
                  📦 {language === 'hi' ? 'Shipment Track करें' : 'Track Shipment'}
                </button>
              </div>
            </div>
          )}

          {/* Support */}
          <div className={styles.supportBar}>
            <span className={styles.supportText}>
              {language === 'hi' ? 'Help चाहिए?' : 'Need help?'}
            </span>
            <button className={styles.supportButton}>
              💬 {language === 'hi' ? 'WhatsApp Support' : 'WhatsApp Support'}
            </button>
          </div>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

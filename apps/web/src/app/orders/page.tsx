'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';
import type { BookingStatus } from '@upaya/shared';

type FilterType = 'all' | 'active' | 'completed';

interface OrderItem {
  id: string;
  pujaName: string;
  pujaNameHi: string;
  templeName: string;
  templeNameHi: string;
  templeCity: string;
  bookingDate: string;
  status: BookingStatus;
  price: number;
}

const BOOKING_STATUS_LABELS: Record<BookingStatus, { hi: string; en: string }> = {
  booked: { hi: 'Booked', en: 'Booked' },
  confirmed_by_temple: { hi: 'Temple ने Confirm किया', en: 'Confirmed' },
  puja_performed: { hi: 'पूजा सम्पन्न', en: 'Puja Performed' },
  video_delivered: { hi: 'Video Delivered', en: 'Video Delivered' },
  prasad_shipped: { hi: 'प्रसाद Shipped', en: 'Prasad Shipped' },
  prasad_delivered: { hi: 'प्रसाद Delivered', en: 'Prasad Delivered' },
  protocol_complete: { hi: 'Complete', en: 'Complete' },
};

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    pujaName: 'Mangal Dosha Nivaran Puja',
    pujaNameHi: 'मंगल दोष निवारण पूजा',
    templeName: 'Mangalnath Temple',
    templeNameHi: 'मंगलनाथ मंदिर',
    templeCity: 'Ujjain',
    bookingDate: '2026-03-05',
    status: 'video_delivered',
    price: 2100,
  },
  {
    id: 'ord-2',
    pujaName: 'Shani Shanti Puja',
    pujaNameHi: 'शनि शांति पूजा',
    templeName: 'Shani Shingnapur Temple',
    templeNameHi: 'शनि शिंगणापुर मंदिर',
    templeCity: 'Ahmednagar',
    bookingDate: '2026-02-20',
    status: 'protocol_complete',
    price: 1800,
  },
];

function getStatusColor(status: BookingStatus): string {
  const active: BookingStatus[] = ['booked', 'confirmed_by_temple', 'puja_performed'];
  const inTransit: BookingStatus[] = ['video_delivered', 'prasad_shipped'];
  if (active.includes(status)) return 'statusActive';
  if (inTransit.includes(status)) return 'statusTransit';
  return 'statusComplete';
}

export default function OrdersListPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const completedStatuses: BookingStatus[] = ['prasad_delivered', 'protocol_complete'];
  const filteredOrders = MOCK_ORDERS.filter((o) => {
    if (filter === 'active') return !completedStatuses.includes(o.status);
    if (filter === 'completed') return completedStatuses.includes(o.status);
    return true;
  });

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={language === 'hi' ? 'मेरे Orders' : 'My Orders'} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Filter tabs */}
          <div className={styles.filterRow}>
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all'
                  ? (language === 'hi' ? 'सभी' : 'All')
                  : f === 'active'
                    ? (language === 'hi' ? 'Active' : 'Active')
                    : (language === 'hi' ? 'Completed' : 'Completed')}
              </button>
            ))}
          </div>

          {/* Orders list */}
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="clipboard" size={48} color="var(--color-accent-gold)" />
              <p className={styles.emptyText}>
                {language === 'hi' ? 'अभी कोई orders नहीं' : 'No orders yet'}
              </p>
              <button className={styles.emptyAction} onClick={() => router.push('/explore')}>
                {language === 'hi' ? 'Pujas explore करें' : 'Explore Pujas'}
              </button>
            </div>
          ) : (
            <div className={styles.orderList}>
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  className={styles.orderCard}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <div className={styles.orderCardHeader}>
                    <div className={styles.orderCardLeft}>
                      <Icon name="diya" size={24} color="var(--color-accent-gold)" />
                      <div className={styles.orderInfo}>
                        <span className={styles.orderPujaName}>
                          {language === 'hi' ? order.pujaNameHi : order.pujaName}
                        </span>
                        <span className={styles.orderTempleName}>
                          {language === 'hi' ? order.templeNameHi : order.templeName}, {order.templeCity}
                        </span>
                      </div>
                    </div>
                    <span className={`${styles.orderStatus} ${styles[getStatusColor(order.status)]}`}>
                      {language === 'hi'
                        ? BOOKING_STATUS_LABELS[order.status].hi
                        : BOOKING_STATUS_LABELS[order.status].en}
                    </span>
                  </div>
                  <div className={styles.orderCardFooter}>
                    <span className={styles.orderDate}>
                      {new Date(order.bookingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={styles.orderPrice}>₹{order.price.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

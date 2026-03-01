'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pujaDate = searchParams.get('date') || '';
  const pujaDateLabel = searchParams.get('dateLabel') || pujaDate;
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const videoDate = pujaDate ? addDays(pujaDate, 5) : '3-5 days';
  const prasadDate = pujaDate ? addDays(pujaDate, 10) : '7-10 days';
  const orderId = `UPY-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return (
    <div className={styles.appLayout}>
      <TopBar onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Success animation */}
          <div className={styles.successSection}>
            {showConfetti && (
              <div className={styles.confetti}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className={styles.confettiPiece} />
                ))}
              </div>
            )}
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className={styles.successTitle}>
              {language === 'hi' ? 'पूजा Booked!' : 'Puja Booked!'}
            </h1>
            <p className={styles.orderId}>
              {language === 'hi' ? 'Order ID' : 'Order ID'}: <strong>{orderId}</strong>
            </p>
          </div>

          {/* What happens next timeline */}
          <div className={styles.timelineCard}>
            <h2 className={styles.timelineTitle}>
              {language === 'hi' ? 'आगे क्या होगा:' : 'What happens next:'}
            </h2>

            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                <div className={styles.timelineContent}>
                  <Icon name="diya" size={20} color="var(--color-accent-gold)" />
                  <div className={styles.timelineText}>
                    <span className={styles.timelineDate}>{pujaDateLabel || pujaDate}</span>
                    <span className={styles.timelineDesc}>
                      {language === 'hi'
                        ? 'आपके संकल्प से पूजा होगी'
                        : 'Puja performed with your sankalp'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <Icon name="video" size={20} color="var(--color-accent-gold)" />
                  <div className={styles.timelineText}>
                    <span className={styles.timelineDate}>~{videoDate}</span>
                    <span className={styles.timelineDesc}>
                      {language === 'hi'
                        ? 'पूजा video delivered (WhatsApp + App)'
                        : 'Puja video delivered (WhatsApp + App)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <Icon name="prasad-box" size={20} color="var(--color-accent-gold)" />
                  <div className={styles.timelineText}>
                    <span className={styles.timelineDate}>~{prasadDate}</span>
                    <span className={styles.timelineDesc}>
                      {language === 'hi'
                        ? 'अभिमंत्रित प्रसाद आपके address पर'
                        : 'Consecrated prasad arrives at your address'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue remedies reminder */}
          <div className={styles.reminderCard}>
            <Icon name="mala" size={24} color="var(--color-accent-gold)" />
            <p className={styles.reminderText}>
              {language === 'hi'
                ? 'अपने plan की बाकी remedies जारी रखें — mantras, fasting, daily practices'
                : 'Continue with other remedies from your plan — mantras, fasting, daily practices'}
            </p>
          </div>

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.primaryAction} onClick={() => router.push(`/orders/${orderId}`)}>
              {language === 'hi' ? 'Order देखें' : 'View Order'}
            </button>
            <button className={styles.secondaryAction} onClick={() => router.push('/home')}>
              {language === 'hi' ? 'Home पर वापस जाएं' : 'Back to Home'}
            </button>
          </div>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

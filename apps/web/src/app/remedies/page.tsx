'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface TrackerRemedy {
  id: string;
  name: string;
  type: 'mantra' | 'fasting' | 'daan' | 'daily_practice';
  frequency: string;
  duration: string;
  completedCount: number;
  totalCount: number;
  todayDone: boolean;
}

interface WeeklyStats {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  karmaPoints: number;
}

const REMEDY_TYPE_ICONS: Record<string, string> = {
  mantra: '\uD83D\uDCFF',
  fasting: '\uD83C\uDF7D\uFE0F',
  daan: '\uD83C\uDF81',
  daily_practice: '\uD83E\uDDD8',
};

function getMockRemedies(language: 'hi' | 'en'): TrackerRemedy[] {
  return [
    {
      id: 'r1',
      name: language === 'hi' ? '\u092E\u0902\u0917\u0932 \u092E\u0902\u0924\u094D\u0930 (Daily)' : 'Mangal Mantra (Daily)',
      type: 'mantra',
      frequency: language === 'hi' ? '108 \u092C\u093E\u0930, \u0939\u0930 \u092E\u0902\u0917\u0932\u0935\u093E\u0930' : '108 times, every Tuesday',
      duration: language === 'hi' ? '9 \u092E\u0902\u0917\u0932\u0935\u093E\u0930' : '9 Tuesdays',
      completedCount: 3,
      totalCount: 9,
      todayDone: false,
    },
    {
      id: 'r2',
      name: language === 'hi' ? '\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0935\u094D\u0930\u0924' : 'Tuesday Fasting',
      type: 'fasting',
      frequency: language === 'hi' ? '\u0939\u0930 \u092E\u0902\u0917\u0932\u0935\u093E\u0930' : 'Every Tuesday',
      duration: language === 'hi' ? '9 \u092E\u0902\u0917\u0932\u0935\u093E\u0930' : '9 Tuesdays',
      completedCount: 3,
      totalCount: 9,
      todayDone: true,
    },
    {
      id: 'r3',
      name: language === 'hi' ? '\u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E (Daily)' : 'Hanuman Chalisa (Daily)',
      type: 'daily_practice',
      frequency: language === 'hi' ? '\u0930\u094B\u091C\u093C 1 \u092C\u093E\u0930' : 'Once daily',
      duration: language === 'hi' ? '9 \u0939\u092B\u093C\u094D\u0924\u0947' : '9 weeks',
      completedCount: 18,
      totalCount: 63,
      todayDone: false,
    },
  ];
}

function getMockStats(): WeeklyStats {
  return {
    currentStreak: 5,
    bestStreak: 12,
    totalCompleted: 24,
    karmaPoints: 240,
  };
}

export default function RemediesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [remedies, setRemedies] = useState<TrackerRemedy[]>([]);
  const [stats, setStats] = useState<WeeklyStats>(getMockStats());
  const [hasActiveProtocol] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setRemedies(getMockRemedies(language));
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleMarkDone = useCallback((remedyId: string) => {
    setRemedies((prev) =>
      prev.map((r) =>
        r.id === remedyId
          ? { ...r, todayDone: true, completedCount: Math.min(r.completedCount + 1, r.totalCount) }
          : r,
      ),
    );
    setStats((prev) => ({
      ...prev,
      totalCompleted: prev.totalCompleted + 1,
      karmaPoints: prev.karmaPoints + 10,
    }));
  }, []);

  const todayTasks = remedies.filter((r) => !r.todayDone);
  const completedToday = remedies.filter((r) => r.todayDone);
  const overallProgress = remedies.length > 0
    ? Math.round(remedies.reduce((sum, r) => sum + r.completedCount, 0) / remedies.reduce((sum, r) => sum + r.totalCount, 0) * 100)
    : 0;

  // Empty state — no active protocol
  if (!hasActiveProtocol) {
    return (
      <div className={styles.appLayout}>
        <TopBar title={language === 'hi' ? 'Remedies' : 'Remedies'} onLanguageToggle={toggleLanguage} />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>{'\uD83D\uDCFF'}</span>
              <h2 className={styles.emptyTitle}>
                {language === 'hi' ? '\u0915\u094B\u0908 active remedy plan \u0928\u0939\u0940\u0902' : 'No active remedy plan'}
              </h2>
              <p className={styles.emptyText}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092C\u0928\u0935\u093E\u090F\u0902 \u0914\u0930 personalized remedies \u092A\u093E\u090F\u0902'
                  : 'Get your kundli analyzed for personalized remedies'}
              </p>
              <button className={styles.emptyCtaButton} onClick={() => router.push('/home')}>
                {language === 'hi' ? 'Start \u0915\u0930\u0947\u0902' : 'Get Started'}
              </button>
            </div>
          </div>
        </main>
        <BottomTabBar language={language} />
      </div>
    );
  }

  return (
    <div className={styles.appLayout}>
      <TopBar title={language === 'hi' ? 'Remedies' : 'Remedies'} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Protocol progress */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressIcon}>{'\uD83D\uDCFF'}</span>
              <div>
                <h2 className={styles.progressTitle}>
                  {language === 'hi' ? '9-Week Protocol' : '9-Week Protocol'}
                </h2>
                <p className={styles.progressSub}>
                  {language === 'hi' ? `Day ${Math.round(overallProgress * 0.63)} of 63` : `Day ${Math.round(overallProgress * 0.63)} of 63`}
                </p>
              </div>
              <span className={styles.progressPercent}>{overallProgress}%</span>
            </div>
            <div className={styles.progressBarOuter}>
              <div className={styles.progressBarInner} style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.currentStreak}</span>
              <span className={styles.statLabel}>{language === 'hi' ? 'Day Streak' : 'Day Streak'}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.totalCompleted}</span>
              <span className={styles.statLabel}>{language === 'hi' ? 'Completed' : 'Completed'}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.karmaPoints}</span>
              <span className={styles.statLabel}>{language === 'hi' ? 'Karma Pts' : 'Karma Pts'}</span>
            </div>
          </div>

          {/* Today's tasks */}
          {todayTasks.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>{'\uD83D\uDCC5'}</span>
                {language === 'hi' ? "Today's Tasks" : "Today's Tasks"}
                <span className={styles.sectionBadge}>{todayTasks.length}</span>
              </h3>

              <div className={styles.remedyList}>
                {todayTasks.map((remedy) => (
                  <div key={remedy.id} className={styles.remedyCard}>
                    <div className={styles.remedyCardLeft}>
                      <span className={styles.remedyTypeIcon}>
                        {REMEDY_TYPE_ICONS[remedy.type] || '\uD83D\uDCFF'}
                      </span>
                      <div className={styles.remedyInfo}>
                        <span className={styles.remedyName}>{remedy.name}</span>
                        <span className={styles.remedyFrequency}>{remedy.frequency}</span>
                        <div className={styles.remedyProgress}>
                          <div className={styles.remedyProgressBar}>
                            <div
                              className={styles.remedyProgressFill}
                              style={{ width: `${(remedy.completedCount / remedy.totalCount) * 100}%` }}
                            />
                          </div>
                          <span className={styles.remedyProgressText}>
                            {remedy.completedCount}/{remedy.totalCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.markDoneButton}
                      onClick={() => handleMarkDone(remedy.id)}
                    >
                      {'\u2713'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed today */}
          {completedToday.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span>{'\u2705'}</span>
                {language === 'hi' ? 'Done Today' : 'Done Today'}
              </h3>
              <div className={styles.remedyList}>
                {completedToday.map((remedy) => (
                  <div key={remedy.id} className={`${styles.remedyCard} ${styles.remedyCardDone}`}>
                    <div className={styles.remedyCardLeft}>
                      <span className={styles.remedyTypeIcon}>
                        {REMEDY_TYPE_ICONS[remedy.type] || '\uD83D\uDCFF'}
                      </span>
                      <div className={styles.remedyInfo}>
                        <span className={styles.remedyName}>{remedy.name}</span>
                        <span className={styles.remedyFrequency}>{remedy.frequency}</span>
                        <div className={styles.remedyProgress}>
                          <div className={styles.remedyProgressBar}>
                            <div
                              className={`${styles.remedyProgressFill} ${styles.remedyProgressFillDone}`}
                              style={{ width: `${(remedy.completedCount / remedy.totalCount) * 100}%` }}
                            />
                          </div>
                          <span className={styles.remedyProgressText}>
                            {remedy.completedCount}/{remedy.totalCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={styles.doneCheck}>{'\u2705'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Puja status placeholder */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span>{'\uD83D\uDED5'}</span>
              {language === 'hi' ? 'Puja Status' : 'Puja Status'}
            </h3>
            <div className={styles.pujaCard}>
              <div className={styles.pujaInfo}>
                <span className={styles.pujaName}>
                  {language === 'hi' ? '\u092E\u0902\u0917\u0932 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E' : 'Mangal Shanti Puja'}
                </span>
                <span className={styles.pujaLocation}>
                  {language === 'hi' ? '\u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930, \u0909\u091C\u094D\u091C\u0948\u0928' : 'Mangalnath Temple, Ujjain'}
                </span>
              </div>
              <span className={styles.pujaStatus}>
                {language === 'hi' ? 'Not Booked' : 'Not Booked'}
              </span>
            </div>
          </div>

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface TrackerRemedy {
  id: string;
  name: string;
  nameHi: string;
  type: 'mantra' | 'fasting' | 'daan' | 'daily_practice';
  frequency: string;
  frequencyHi: string;
  mantraPreview: string | null;
  completedCount: number;
  totalCount: number;
  todayDone: boolean;
  streak: number;
}

interface PujaStatusItem {
  id: string;
  name: string;
  nameHi: string;
  temple: string;
  templeHi: string;
  date: string;
  status: 'completed' | 'scheduled' | 'pending';
  hasVideo: boolean;
  prasadStatus: string | null;
}

interface WeeklyDay {
  dayLabel: string;
  completed: boolean;
}

const REMEDY_TYPE_ICONS: Record<string, string> = {
  mantra: '\uD83D\uDCFF',
  fasting: '\uD83C\uDF7D\uFE0F',
  daan: '\uD83C\uDF81',
  daily_practice: '\uD83E\uDDD8',
};

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function generateWeekDays(fillRate: number): WeeklyDay[] {
  return DAY_LABELS.map((d) => ({
    dayLabel: d,
    completed: Math.random() < fillRate,
  }));
}

function getMockRemedies(): TrackerRemedy[] {
  return [
    {
      id: 'r1', name: 'Mangal Mantra (108 times)', nameHi: '\u092E\u0902\u0917\u0932 \u092E\u0902\u0924\u094D\u0930 (108 \u092C\u093E\u0930)',
      type: 'mantra', frequency: '108 times daily', frequencyHi: '108 \u092C\u093E\u0930 \u0930\u094B\u091C\u093C',
      mantraPreview: 'Om Kraam Kreem Kraum Sah\u2026', completedCount: 12, totalCount: 63, todayDone: false, streak: 12,
    },
    {
      id: 'r2', name: 'Hanuman Chalisa (1 time)', nameHi: '\u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E (1 \u092C\u093E\u0930)',
      type: 'daily_practice', frequency: 'Once daily', frequencyHi: '\u0930\u094B\u091C\u093C 1 \u092C\u093E\u0930',
      mantraPreview: null, completedCount: 8, totalCount: 63, todayDone: false, streak: 8,
    },
    {
      id: 'r3', name: 'Tuesday Fast', nameHi: '\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0935\u094D\u0930\u0924',
      type: 'fasting', frequency: 'Every Tuesday', frequencyHi: '\u0939\u0930 \u092E\u0902\u0917\u0932\u0935\u093E\u0930',
      mantraPreview: null, completedCount: 2, totalCount: 9, todayDone: true, streak: 2,
    },
  ];
}

function getMockPujas(): PujaStatusItem[] {
  return [
    { id: 'p1', name: 'Mangal Shanti Puja', nameHi: '\u092E\u0902\u0917\u0932 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E', temple: 'Mangalnath, Ujjain', templeHi: '\u092E\u0902\u0917\u0932\u0928\u093E\u0925, \u0909\u091C\u094D\u091C\u0948\u0928', date: '25 Feb 2026', status: 'completed', hasVideo: true, prasadStatus: 'Shipped \u2014 Arriving 5 Mar' },
    { id: 'p2', name: 'Shani Shanti Puja', nameHi: '\u0936\u0928\u093F \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E', temple: 'Shani Temple, Ujjain', templeHi: '\u0936\u0928\u093F \u092E\u0902\u0926\u093F\u0930, \u0909\u091C\u094D\u091C\u0948\u0928', date: '8 Mar 2026', status: 'scheduled', hasVideo: false, prasadStatus: null },
  ];
}

const PUJA_BORDER: Record<string, string> = { completed: 'var(--color-success)', scheduled: 'var(--color-warning)', pending: 'var(--color-neutral-grey-400)' };

export default function RemediesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [remedies, setRemedies] = useState<TrackerRemedy[]>([]);
  const [pujas, setPujas] = useState<PujaStatusItem[]>([]);
  const [hasProtocol] = useState(true);
  const [karmaPoints, setKarmaPoints] = useState(340);
  const [currentStreak] = useState(12);
  const [totalCompleted, setTotalCompleted] = useState(24);
  const [completionRate] = useState(89);
  const protocolDay = 14;
  const protocolTotal = 63;
  const overallPct = Math.round((protocolDay / protocolTotal) * 100);

  const [thisWeek] = useState(() => generateWeekDays(0.85));
  const [lastWeek] = useState(() => generateWeekDays(0.95));

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => { setRemedies(getMockRemedies()); setPujas(getMockPujas()); }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const handleDone = useCallback((id: string) => {
    setRemedies((p) => p.map((r) => r.id === id ? { ...r, todayDone: true, completedCount: Math.min(r.completedCount + 1, r.totalCount), streak: r.streak + 1 } : r));
    setKarmaPoints((p) => p + 10);
    setTotalCompleted((p) => p + 1);
  }, []);

  const todo = remedies.filter((r) => !r.todayDone);
  const done = remedies.filter((r) => r.todayDone);
  const t = (hi: string, en: string) => language === 'hi' ? hi : en;

  if (!hasProtocol) {
    return (
      <div className={styles.appLayout}>
        <TopBar title="Remedies" onLanguageToggle={toggleLanguage} />
        <main className={styles.mainContent}><div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{'\uD83D\uDCFF'}</span>
            <h2 className={styles.emptyTitle}>{t('\u0915\u094B\u0908 active remedy plan \u0928\u0939\u0940\u0902', 'No active remedy plan')}</h2>
            <p className={styles.emptyText}>{t('\u0905\u092A\u0928\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092C\u0928\u0935\u093E\u090F\u0902 \u0914\u0930 personalized remedies \u092A\u093E\u090F\u0902', 'Get your kundli analyzed for personalized remedies')}</p>
            <button className={styles.emptyCtaButton} onClick={() => router.push('/home')}>{t('Start \u0915\u0930\u0947\u0902', 'Get Started')}</button>
          </div>
        </div></main>
        <BottomTabBar language={language} />
      </div>
    );
  }

  return (
    <div className={styles.appLayout}>
      <TopBar title="Remedies" onLanguageToggle={toggleLanguage} />
      <main className={styles.mainContent}><div className={styles.container}>

        {/* Protocol Header */}
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span className={styles.progressIcon}>{'\uD83D\uDCFF'}</span>
            <div className={styles.progressInfo}>
              <h2 className={styles.progressTitle}>Day {protocolDay} of {protocolTotal} &mdash; Keep Going!</h2>
              <p className={styles.progressSub}>Mangal + Shani Dosha Protocol</p>
              <p className={styles.progressDates}>Started: 7 Feb 2026 &rarr; Target: 10 Apr 2026</p>
            </div>
            <span className={styles.progressPercent}>{overallPct}%</span>
          </div>
          <div className={styles.progressBarOuter}><div className={styles.progressBarInner} style={{ width: `${overallPct}%` }} /></div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}><span className={styles.statValue}>{currentStreak}</span><span className={styles.statLabel}>{t('Day Streak', 'Day Streak')}</span></div>
          <div className={styles.statCard}><span className={styles.statValue}>{totalCompleted}</span><span className={styles.statLabel}>{t('Completed', 'Completed')}</span></div>
          <div className={styles.statCard}><span className={styles.statValueGold}>{karmaPoints}</span><span className={styles.statLabel}>Karma Pts</span></div>
        </div>

        {/* Today's Tasks */}
        {todo.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><span>{'\uD83D\uDCC5'}</span>{t("Today's Tasks", "Today's Tasks")}<span className={styles.sectionBadge}>{todo.length}</span></h3>
            <div className={styles.remedyList}>
              {todo.map((r) => (
                <div key={r.id} className={styles.remedyCard}>
                  <div className={styles.remedyCardLeft}>
                    <span className={styles.remedyTypeIcon}>{REMEDY_TYPE_ICONS[r.type]}</span>
                    <div className={styles.remedyInfo}>
                      <span className={styles.remedyName}>{t(r.nameHi, r.name)}</span>
                      {r.mantraPreview && <span className={styles.mantraPreview}>&ldquo;{r.mantraPreview}&rdquo;</span>}
                      <span className={styles.remedyFrequency}>{t(r.frequencyHi, r.frequency)}</span>
                      <span className={styles.streakBadge}>{'\uD83D\uDD25'} {r.streak} {t('\u0926\u093F\u0928', 'days')}</span>
                      <div className={styles.remedyProgress}>
                        <div className={styles.remedyProgressBar}><div className={styles.remedyProgressFill} style={{ width: `${(r.completedCount / r.totalCount) * 100}%` }} /></div>
                        <span className={styles.remedyProgressText}>{r.completedCount}/{r.totalCount}</span>
                      </div>
                      <div className={styles.remedyActions}>
                        {r.type === 'mantra' && <button className={styles.guidedMantraBtn} onClick={() => router.push(`/remedies/mantra?taskId=${r.id}`)}>{'\uD83D\uDCFF'} {t('Start Guided Mantra', 'Start Guided Mantra')}</button>}
                        {r.type === 'daily_practice' && <button className={styles.readAlongBtn}>{'\uD83D\uDCD6'} {t('Read Along / Audio', 'Read Along / Audio')}</button>}
                      </div>
                    </div>
                  </div>
                  <button className={styles.markDoneButton} onClick={() => handleDone(r.id)} aria-label="Mark done">{'\u2713'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done Today */}
        {done.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><span>{'\u2705'}</span>{t('Done Today', 'Done Today')}</h3>
            <div className={styles.remedyList}>
              {done.map((r) => (
                <div key={r.id} className={`${styles.remedyCard} ${styles.remedyCardDone}`}>
                  <div className={styles.remedyCardLeft}>
                    <span className={styles.remedyTypeIcon}>{REMEDY_TYPE_ICONS[r.type]}</span>
                    <div className={styles.remedyInfo}>
                      <span className={styles.remedyName}>{t(r.nameHi, r.name)}</span>
                      <span className={styles.remedyFrequency}>{t(r.frequencyHi, r.frequency)}</span>
                      <span className={styles.streakBadge}>{'\uD83D\uDD25'} {r.streak} {t('\u0926\u093F\u0928', 'days')}</span>
                    </div>
                  </div>
                  <span className={styles.doneCheck}>{'\u2705'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Puja Status */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}><span>{'\uD83D\uDED5'}</span>{t('Puja Status', 'Puja Status')}</h3>
          <div className={styles.pujaList}>
            {pujas.map((p) => (
              <div key={p.id} className={styles.pujaCard} style={{ borderLeftColor: PUJA_BORDER[p.status] }}>
                <div className={styles.pujaInfo}>
                  <div className={styles.pujaHeader}>
                    <span>{p.status === 'completed' ? '\u2705' : p.status === 'scheduled' ? '\uD83D\uDCC5' : '\u23F3'}</span>
                    <span className={styles.pujaName}>{t(p.nameHi, p.name)}</span>
                  </div>
                  <span className={styles.pujaLocation}>{t(p.templeHi, p.temple)} &mdash; {p.date}</span>
                  <span className={styles.pujaStatusLabel} style={{ color: PUJA_BORDER[p.status] }}>
                    Status: {p.status === 'completed' ? 'Completed' : p.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                  </span>
                  {p.hasVideo && <button className={styles.pujaVideoBtn}>{'\u25B6\uFE0F'} {t('Video \u0926\u0947\u0916\u0947\u0902', 'Watch Puja Video')}</button>}
                  {p.prasadStatus && <span className={styles.prasadStatus}>{'\uD83D\uDCE6'} Prasad: {p.prasadStatus}</span>}
                  {!p.hasVideo && p.status !== 'completed' && <button className={styles.pujaDetailBtn}>{t('Details \u0926\u0947\u0916\u0947\u0902', 'View Details')}</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Stats */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}><span>{'\uD83D\uDCC8'}</span>{t('Weekly Stats', 'Weekly Stats')}</h3>
          <div className={styles.weeklyCard}>
            <div className={styles.weekRow}>
              {thisWeek.map((d, i) => (
                <div key={`tw-${i}`} className={styles.weekDayCol}>
                  <span className={styles.weekDayLabel}>{d.dayLabel}</span>
                  <span className={`${styles.weekDayDot} ${d.completed ? styles.weekDayDotDone : ''}`}>{d.completed ? '\u2713' : ''}</span>
                </div>
              ))}
              <span className={styles.weekLabel}>This wk</span>
            </div>
            <div className={styles.weekRow}>
              {lastWeek.map((d, i) => (
                <div key={`lw-${i}`} className={styles.weekDayCol}>
                  <span className={`${styles.weekDayDot} ${d.completed ? styles.weekDayDotDone : ''}`}>{d.completed ? '\u2713' : ''}</span>
                </div>
              ))}
              <span className={styles.weekLabel}>Last wk</span>
            </div>
            <div className={styles.weeklyStatsRow}>
              <span>Karma Points: <strong>{karmaPoints}</strong></span>
              <span>Streak: <strong>{currentStreak} days</strong></span>
              <span>Rate: <strong>{completionRate}%</strong></span>
            </div>
          </div>
        </div>

      </div></main>
      <BottomTabBar language={language} />
    </div>
  );
}

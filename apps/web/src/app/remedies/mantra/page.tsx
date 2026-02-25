'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

type CountMode = 'tap' | 'auto' | 'voice';

interface MantraData {
  id: string;
  name: string;
  nameHi: string;
  mantraText: string;
  mantraTextHi: string;
  targetCount: number;
  frequency: string;
}

const MOCK_MANTRA: MantraData = {
  id: 'r1',
  name: 'Mangal Mantra',
  nameHi: '\u092E\u0902\u0917\u0932 \u092E\u0902\u0924\u094D\u0930',
  mantraText: 'Om Kraam Kreem Kraum Sah Bhaumaaya Namah',
  mantraTextHi: '\u0913\u092E\u094D \u0915\u094D\u0930\u093E\u0902 \u0915\u094D\u0930\u0940\u0902 \u0915\u094D\u0930\u094C\u0902 \u0938\u0903 \u092D\u094C\u092E\u093E\u092F \u0928\u092E\u0903',
  targetCount: 108,
  frequency: 'Daily',
};

const TOTAL_BEADS = 108;
const BEADS_PER_RING = 27;

export default function MantraPlayerPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<CountMode>('tap');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const target = MOCK_MANTRA.targetCount;

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);

  const handleTap = useCallback(() => {
    if (isComplete) return;
    setCount((prev) => {
      const next = prev + 1;
      if (next >= target) setIsComplete(true);
      return Math.min(next, target);
    });
  }, [isComplete, target]);

  const toggleAuto = useCallback(() => {
    if (isComplete) return;
    if (isRunning) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      setIsRunning(false);
    } else {
      setIsRunning(true);
      autoTimerRef.current = setInterval(() => {
        setCount((prev) => {
          const next = prev + 1;
          if (next >= target) {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            autoTimerRef.current = null;
            setIsRunning(false);
            setIsComplete(true);
            return target;
          }
          return next;
        });
      }, 2000);
    }
  }, [isComplete, isRunning, target]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, []);

  const handleReset = () => {
    setCount(0);
    setIsComplete(false);
    setIsRunning(false);
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = null;
  };

  const pct = Math.round((count / target) * 100);

  // Build mala beads visualization
  const renderMala = () => {
    const beads = [];
    for (let i = 0; i < TOTAL_BEADS; i++) {
      const isDone = i < count;
      const isCurrent = i === count;
      const ring = Math.floor(i / BEADS_PER_RING);
      const posInRing = i % BEADS_PER_RING;
      const angle = (posInRing / BEADS_PER_RING) * 360 - 90;
      const radius = 38 - ring * 10;
      const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
      const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
      const size = isCurrent ? 3 : 2;
      beads.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={size}
          fill={isDone ? '#FF8C00' : isCurrent ? '#D4A017' : '#E5E7EB'}
          stroke={isCurrent ? '#D4A017' : 'none'}
          strokeWidth={isCurrent ? 1 : 0}
          opacity={isDone ? 1 : 0.5}
        />
      );
    }
    return beads;
  };

  return (
    <div className={styles.appLayout}>
      <TopBar
        title={t('\u092E\u0902\u0924\u094D\u0930 \u091C\u092A', 'Mantra Player')}
        showBack
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Mantra Name */}
          <div className={styles.mantraHeader}>
            <h1 className={styles.mantraName}>{t(MOCK_MANTRA.nameHi, MOCK_MANTRA.name)}</h1>
            <p className={styles.mantraTarget}>
              {t(`\u0932\u0915\u094D\u0937\u094D\u092F: ${target} \u092C\u093E\u0930`, `Target: ${target} times`)}
            </p>
          </div>

          {/* Mantra Text Display */}
          <div className={styles.mantraTextCard}>
            <p className={styles.mantraTextHi}>{MOCK_MANTRA.mantraTextHi}</p>
            <p className={styles.mantraTextEn}>{MOCK_MANTRA.mantraText}</p>
          </div>

          {/* Mala Visualization */}
          <div className={styles.malaContainer} onClick={mode === 'tap' ? handleTap : undefined}>
            <svg viewBox="0 0 100 100" className={styles.malaSvg}>
              {renderMala()}
              {/* Center count */}
              <text x="50" y="48" textAnchor="middle" className={styles.malaCountText} fontSize="10" fill="#1F2937" fontWeight="700">
                {count}
              </text>
              <text x="50" y="56" textAnchor="middle" fontSize="4" fill="#9CA3AF">
                / {target}
              </text>
            </svg>
            {mode === 'tap' && !isComplete && (
              <p className={styles.tapHint}>{t('\u091F\u0948\u092A \u0915\u0930\u0947\u0902', 'Tap to count')}</p>
            )}
          </div>

          {/* Progress */}
          <div className={styles.progressRow}>
            <div className={styles.progressBarOuter}>
              <div className={styles.progressBarInner} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.progressPct}>{pct}%</span>
          </div>

          {/* Mode Selector */}
          <div className={styles.modeRow}>
            {(['tap', 'auto', 'voice'] as CountMode[]).map((m) => (
              <button
                key={m}
                className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
                onClick={() => {
                  setMode(m);
                  if (m !== 'auto' && autoTimerRef.current) {
                    clearInterval(autoTimerRef.current);
                    autoTimerRef.current = null;
                    setIsRunning(false);
                  }
                }}
              >
                {m === 'tap' ? '\u270B' : m === 'auto' ? '\u23F1\uFE0F' : '\uD83C\uDF99\uFE0F'}
                <span>{m === 'tap' ? t('\u091F\u0948\u092A', 'Tap') : m === 'auto' ? t('\u0911\u091F\u094B', 'Auto') : t('\u0935\u0949\u0907\u0938', 'Voice')}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            {mode === 'auto' && (
              <button className={styles.playPauseBtn} onClick={toggleAuto}>
                {isRunning ? '\u23F8\uFE0F' : '\u25B6\uFE0F'} {isRunning ? t('\u0930\u0941\u0915\u0947\u0902', 'Pause') : t('\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'Start')}
              </button>
            )}
            <button className={styles.resetBtn} onClick={handleReset}>
              {'\u21BA'} {t('Reset', 'Reset')}
            </button>
          </div>

          {/* Completion */}
          {isComplete && (
            <div className={styles.completeCard}>
              <span className={styles.completeIcon}>{'\uD83C\uDF89'}</span>
              <h3 className={styles.completeTitle}>
                {t('\u092C\u0927\u093E\u0908! \u092E\u0902\u0924\u094D\u0930 \u091C\u092A \u092A\u0942\u0930\u093E \u0939\u0941\u0906!', 'Congratulations! Mantra chanting complete!')}
              </h3>
              <p className={styles.completeKarma}>+10 Karma Points</p>
              <button className={styles.doneBtn} onClick={() => router.back()}>
                {t('\u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902', 'Go Back')}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

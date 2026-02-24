'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

// ---- Types ----

type AnimationPhase = 1 | 2 | 3 | 4;

interface PlanetData {
  symbol: string;
  name: string;
  house: number;
  revealed: boolean;
}

interface DoshaCheckItem {
  key: string;
  label: string;
  status: 'pending' | 'checking' | 'done';
}

// ---- Planet placement angles on wheel (12 houses, 30 degrees each) ----

function getPositionOnCircle(index: number, total: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
    transform: 'translate(-50%, -50%)',
  };
}

// ---- Stars ----

function generateStars(count: number): { top: string; left: string; size: number; delay: number }[] {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    });
  }
  return stars;
}

// ---- Planet definitions ----

const PLANETS: PlanetData[] = [
  { symbol: '☀️', name: 'Sun', house: 1, revealed: false },
  { symbol: '🌙', name: 'Moon', house: 4, revealed: false },
  { symbol: '♂️', name: 'Mars', house: 7, revealed: false },
  { symbol: '☿', name: 'Mercury', house: 3, revealed: false },
  { symbol: '♃', name: 'Jupiter', house: 2, revealed: false },
  { symbol: '♀', name: 'Venus', house: 6, revealed: false },
  { symbol: '♄', name: 'Saturn', house: 7, revealed: false },
  { symbol: '☊', name: 'Rahu', house: 12, revealed: false },
  { symbol: '☋', name: 'Ketu', house: 6, revealed: false },
];

// ---- Component ----

function KundliAnimationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dob = searchParams.get('dob') || '';
  const tob = searchParams.get('tob') || '';
  const place = searchParams.get('place') || '';
  const lang = (searchParams.get('lang') || 'hi') as 'hi' | 'en';

  const [phase, setPhase] = useState<AnimationPhase>(1);
  const [progress, setProgress] = useState(0);
  const [planets, setPlanets] = useState<PlanetData[]>(PLANETS.map((p) => ({ ...p })));
  const [revealedCount, setRevealedCount] = useState(0);
  const [doshaChecks, setDoshaChecks] = useState<DoshaCheckItem[]>([]);
  const [discoveryMessages, setDiscoveryMessages] = useState<string[]>([]);

  const stars = useMemo(() => generateStars(60), []);

  // Dosha check items per language
  const doshaCheckLabels = useMemo(
    () =>
      lang === 'hi'
        ? [
            { key: 'mangal', label: 'मंगल दोष check कर रहे हैं...' },
            { key: 'shani', label: 'शनि दोष check कर रहे हैं...' },
            { key: 'rahuKetu', label: 'राहु-केतु दोष check कर रहे हैं...' },
            { key: 'kaalSarp', label: 'काल सर्प योग check कर रहे हैं...' },
            { key: 'pitra', label: 'पितृ दोष check कर रहे हैं...' },
            { key: 'dasha', label: 'दशा periods analyze कर रहे हैं...' },
            { key: 'severity', label: 'Severity compute कर रहे हैं...' },
          ]
        : [
            { key: 'mangal', label: 'Checking Mangal Dosha...' },
            { key: 'shani', label: 'Checking Shani Dosha...' },
            { key: 'rahuKetu', label: 'Checking Rahu-Ketu Dosha...' },
            { key: 'kaalSarp', label: 'Checking Kaal Sarp Yog...' },
            { key: 'pitra', label: 'Checking Pitra Dosha...' },
            { key: 'dasha', label: 'Analyzing Dasha periods...' },
            { key: 'severity', label: 'Computing severity...' },
          ],
    [lang]
  );

  // Phase 1: Computing planetary positions (0-25% progress)
  useEffect(() => {
    if (phase !== 1) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 25) {
          clearInterval(interval);
          setTimeout(() => setPhase(2), 300);
          return 25;
        }
        return p + 1;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Scanning planets (25-60% progress, reveal planets one by one)
  useEffect(() => {
    if (phase !== 2) return;

    let currentPlanet = 0;
    const planetInterval = setInterval(() => {
      if (currentPlanet >= PLANETS.length) {
        clearInterval(planetInterval);
        setTimeout(() => setPhase(3), 500);
        return;
      }

      // Reveal next planet
      const idx = currentPlanet;
      setPlanets((prev) => prev.map((p, i) => (i === idx ? { ...p, revealed: true } : p)));
      setRevealedCount((c) => c + 1);

      // Discovery message
      const planet = PLANETS[idx];
      const msg =
        lang === 'hi'
          ? `${planet.symbol} ${planet.name} → ${planet.house}th house`
          : `${planet.symbol} ${planet.name} → ${planet.house}th house`;
      setDiscoveryMessages((prev) => [...prev.slice(-3), msg]);

      // Progress
      setProgress(25 + Math.round(((idx + 1) / PLANETS.length) * 35));

      currentPlanet++;
    }, 400);

    return () => clearInterval(planetInterval);
  }, [phase, lang]);

  // Phase 3: Analyzing doshas (60-90% progress)
  useEffect(() => {
    if (phase !== 3) return;

    setDoshaChecks(
      doshaCheckLabels.map((d) => ({ ...d, status: 'pending' as const }))
    );

    let currentCheck = 0;
    const checkInterval = setInterval(() => {
      if (currentCheck >= doshaCheckLabels.length) {
        clearInterval(checkInterval);
        setTimeout(() => setPhase(4), 500);
        return;
      }

      const idx = currentCheck;

      // Mark current as checking
      setDoshaChecks((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, status: 'checking' } : d))
      );

      // Mark previous as done
      if (idx > 0) {
        setDoshaChecks((prev) =>
          prev.map((d, i) => (i === idx - 1 ? { ...d, status: 'done' } : d))
        );
      }

      setProgress(60 + Math.round(((idx + 1) / doshaCheckLabels.length) * 30));

      currentCheck++;
    }, 500);

    // Cleanup: mark last as done when transitioning
    return () => {
      clearInterval(checkInterval);
    };
  }, [phase, doshaCheckLabels]);

  // Phase 4: Complete (100% progress)
  useEffect(() => {
    if (phase !== 4) return;

    setProgress(100);
    // Mark all dosha checks as done
    setDoshaChecks((prev) => prev.map((d) => ({ ...d, status: 'done' })));
  }, [phase]);

  // Navigate to diagnosis screen with birth details and problem type
  const handleViewDiagnosis = useCallback(() => {
    const problem = searchParams.get('problem') || 'marriage_delay';
    const params = new URLSearchParams({
      problem,
      lang,
      dob,
      place,
    });
    router.push(`/chat/diagnosis?${params.toString()}`);
  }, [router, searchParams, lang, dob, place]);

  // Phase titles
  const phaseTitle = (() => {
    switch (phase) {
      case 1:
        return lang === 'hi' ? 'आपकी कुंडली बन रही है...' : 'Generating your Kundli...';
      case 2:
        return lang === 'hi' ? 'ग्रह Scan हो रहे हैं...' : 'Scanning Planets...';
      case 3:
        return lang === 'hi' ? 'दोष Analysis हो रहा है...' : 'Analyzing Doshas...';
      case 4:
        return lang === 'hi' ? 'Analysis Complete' : 'Analysis Complete';
    }
  })();

  const phaseSub = (() => {
    switch (phase) {
      case 1:
        return lang === 'hi'
          ? `Computing planetary positions for ${dob}, ${tob || 'approximate'}, ${place}...`
          : `Computing planetary positions for ${dob}, ${tob || 'approximate'}, ${place}...`;
      case 2:
        return lang === 'hi'
          ? `${revealedCount}/${PLANETS.length} ग्रह scan हुए`
          : `${revealedCount}/${PLANETS.length} planets scanned`;
      case 3:
        return lang === 'hi'
          ? 'सभी दोषों की जाँच हो रही है...'
          : 'Checking all doshas...';
      case 4:
        return '';
    }
  })();

  return (
    <div className={styles.animationLayout}>
      {/* Starfield */}
      <div className={styles.starfield}>
        {stars.map((star, i) => (
          <span
            key={i}
            className={styles.star}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        {/* Birth detail summary chips */}
        <div className={styles.birthSummary}>
          <span className={styles.birthSummaryItem}>
            <span className={styles.birthSummaryIcon}>📅</span>
            {dob}
          </span>
          {tob && (
            <span className={styles.birthSummaryItem}>
              <span className={styles.birthSummaryIcon}>🕐</span>
              {tob}
            </span>
          )}
          <span className={styles.birthSummaryItem}>
            <span className={styles.birthSummaryIcon}>📍</span>
            {place}
          </span>
        </div>

        {/* Kundli Wheel */}
        <div className={styles.wheelContainer}>
          <div className={styles.wheelOuter} />
          <div className={styles.wheelMiddle} />
          <div className={styles.wheelInner} />
          <div className={styles.wheelCenter}>
            <span className={styles.wheelCenterSymbol}>
              {phase === 4 ? '✨' : '🙏'}
            </span>
          </div>

          {/* Planet nodes positioned around the wheel */}
          {planets.map((planet, i) => {
            const pos = getPositionOnCircle(i, planets.length, 42);
            return (
              <div
                key={`${planet.name}-${i}`}
                className={`${styles.planetNode} ${
                  planet.revealed ? styles.planetNodeRevealed : styles.planetNodeHidden
                }`}
                style={{
                  ...pos,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {planet.revealed ? planet.symbol : '?'}
              </div>
            );
          })}
        </div>

        {/* Phase title and subtitle */}
        <div>
          <h2 className={styles.phaseTitle} key={`title-${phase}`}>
            {phaseTitle}
          </h2>
          {phaseSub && (
            <p className={styles.phaseSub} key={`sub-${phase}`}>
              {phaseSub}
            </p>
          )}
        </div>

        {/* Phase 2: Planet discovery messages */}
        {phase === 2 && discoveryMessages.length > 0 && (
          <div className={styles.discoveryMessages}>
            {discoveryMessages.map((msg, i) => (
              <div key={i} className={styles.discoveryLine} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.discoveryIcon}>&#10148;</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Phase 3: Dosha checklist */}
        {(phase === 3 || phase === 4) && doshaChecks.length > 0 && (
          <div className={styles.doshaChecklist}>
            {doshaChecks.map((check) => (
              <div
                key={check.key}
                className={`${styles.doshaCheckItem} ${
                  check.status === 'checking' ? styles.doshaCheckItemActive : ''
                } ${check.status === 'done' ? styles.doshaCheckItemDone : ''}`}
              >
                <span
                  className={`${styles.doshaCheckIcon} ${
                    check.status === 'checking' ? styles.doshaCheckIconActive : ''
                  } ${check.status === 'done' ? styles.doshaCheckIconDone : ''}`}
                >
                  {check.status === 'done' ? '✓' : check.status === 'checking' ? '◌' : ''}
                </span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Phase 4: Complete */}
        {phase === 4 && (
          <div className={styles.completeSection}>
            <span className={styles.completeIcon}>✨</span>
            <h2 className={styles.completeTitle}>
              {lang === 'hi' ? 'Analysis Complete' : 'Analysis Complete'}
            </h2>
            <p className={styles.completeSub}>
              {lang === 'hi'
                ? 'आपकी कुंडली analysis तैयार है'
                : 'Your kundli analysis is ready'}
            </p>
            <button className={styles.viewDiagnosisButton} onClick={handleViewDiagnosis}>
              {lang === 'hi' ? 'अपनी Diagnosis देखें' : 'View Your Diagnosis'}
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressLabel}>{progress}%</p>
        </div>
      </div>
    </div>
  );
}

export default function KundliAnimationPage() {
  return (
    <Suspense fallback={<div className={styles.animationLayout} />}>
      <KundliAnimationContent />
    </Suspense>
  );
}

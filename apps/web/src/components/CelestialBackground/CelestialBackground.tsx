'use client';

import { useMemo } from 'react';
import styles from './CelestialBackground.module.css';

interface CelestialBackgroundProps {
  variant: 'splash' | 'subtle' | 'page';
}

/** Simple seeded random for deterministic star/planet positions */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CONFIGS = {
  splash: {
    starCount: 40,
    starSizeRange: [1, 3],
    opacityRange: [0.15, 0.5],
    twinkleDuration: [2, 5],
    planetCount: 3,
    planetSizeRange: [4, 12],
    glowRadius: 8,
    floatDuration: [20, 40],
    planetColors: ['#FFD700', '#D4A017', '#FFB347'],
  },
  subtle: {
    starCount: 20,
    starSizeRange: [1, 2],
    opacityRange: [0.1, 0.2],
    twinkleDuration: [3, 6],
    planetCount: 1,
    planetSizeRange: [4, 8],
    glowRadius: 4,
    floatDuration: [25, 40],
    planetColors: ['#D4A017'],
  },
  page: {
    starCount: 30,
    starSizeRange: [1, 2.5],
    opacityRange: [0.08, 0.2],
    twinkleDuration: [3, 7],
    planetCount: 2,
    planetSizeRange: [3, 8],
    glowRadius: 5,
    floatDuration: [25, 45],
    planetColors: ['#D4A017', '#FFB347'],
  },
} as const;

export default function CelestialBackground({ variant }: CelestialBackgroundProps) {
  const config = CONFIGS[variant];
  const rand = useMemo(() => seededRandom(42), []);

  const stars = useMemo(() => {
    const r = rand;
    return Array.from({ length: config.starCount }, (_, i) => {
      const size = config.starSizeRange[0] + r() * (config.starSizeRange[1] - config.starSizeRange[0]);
      const twinkle = config.twinkleDuration[0] + r() * (config.twinkleDuration[1] - config.twinkleDuration[0]);
      return {
        id: i,
        left: `${r() * 100}%`,
        top: `${r() * 100}%`,
        size,
        twinkleDuration: `${twinkle}s`,
        twinkleDelay: `${r() * twinkle}s`,
        opacityMin: config.opacityRange[0],
        opacityMax: config.opacityRange[1],
      };
    });
  }, [config, rand]);

  const planets = useMemo(() => {
    const r = rand;
    return Array.from({ length: config.planetCount }, (_, i) => {
      const size = config.planetSizeRange[0] + r() * (config.planetSizeRange[1] - config.planetSizeRange[0]);
      const floatDur = config.floatDuration[0] + r() * (config.floatDuration[1] - config.floatDuration[0]);
      return {
        id: i,
        left: `${15 + r() * 70}%`,
        top: `${10 + r() * 80}%`,
        size,
        color: config.planetColors[i % config.planetColors.length],
        floatDuration: `${floatDur}s`,
        floatDelay: `${r() * 10}s`,
        glowRadius: config.glowRadius,
      };
    });
  }, [config, rand]);

  return (
    <div className={styles.container} aria-hidden="true">
      {stars.map((star) => (
        <span
          key={`star-${star.id}`}
          className={styles.star}
          data-variant={variant}
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--twinkle-duration': star.twinkleDuration,
            '--twinkle-delay': star.twinkleDelay,
            '--twinkle-min': star.opacityMin,
            '--twinkle-max': star.opacityMax,
          } as React.CSSProperties}
        />
      ))}
      {planets.map((planet) => (
        <div
          key={`planet-${planet.id}`}
          className={styles.planet}
          data-variant={variant}
          style={{
            left: planet.left,
            top: planet.top,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            '--planet-color': planet.color,
            '--glow-radius': `${planet.glowRadius}px`,
            '--float-duration': planet.floatDuration,
            '--float-delay': planet.floatDelay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

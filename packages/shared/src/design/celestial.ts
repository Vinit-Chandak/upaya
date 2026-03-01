/**
 * Upaya Design System — Celestial Background Configuration
 *
 * Defines star and planet animation parameters for the celestial theme.
 * Used by CelestialBackground components on web (CSS) and mobile (Animated API).
 */

export interface StarConfig {
  count: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
  twinkleDuration: [number, number];
}

export interface PlanetConfig {
  count: number;
  sizeRange: [number, number];
  glowRadius: number;
  floatDuration: [number, number];
  colors: string[];
}

export interface CelestialVariantConfig {
  stars: StarConfig;
  planets: PlanetConfig;
}

export const celestialConfig = {
  splash: {
    stars: {
      count: 40,
      sizeRange: [1, 3] as [number, number],
      opacityRange: [0.15, 0.5] as [number, number],
      twinkleDuration: [2, 5] as [number, number],
    },
    planets: {
      count: 3,
      sizeRange: [4, 12] as [number, number],
      glowRadius: 8,
      floatDuration: [20, 40] as [number, number],
      colors: ['#FFD700', '#D4A017', '#FFB347'],
    },
  },
  subtle: {
    stars: {
      count: 20,
      sizeRange: [1, 2] as [number, number],
      opacityRange: [0.1, 0.2] as [number, number],
      twinkleDuration: [3, 6] as [number, number],
    },
    planets: {
      count: 1,
      sizeRange: [4, 8] as [number, number],
      glowRadius: 4,
      floatDuration: [25, 40] as [number, number],
      colors: ['#D4A017'],
    },
  },
  page: {
    stars: {
      count: 30,
      sizeRange: [1, 2.5] as [number, number],
      opacityRange: [0.08, 0.2] as [number, number],
      twinkleDuration: [3, 7] as [number, number],
    },
    planets: {
      count: 2,
      sizeRange: [3, 8] as [number, number],
      glowRadius: 5,
      floatDuration: [25, 45] as [number, number],
      colors: ['#D4A017', '#FFB347'],
    },
  },
} as const;

export type CelestialVariant = keyof typeof celestialConfig;

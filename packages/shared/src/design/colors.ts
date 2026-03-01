/**
 * Upaya Design System — Color Palette
 *
 * Primary: Saffron/Gold tones (warmth, spirituality, trust)
 * Secondary: Deep Maroon (depth, tradition, grounding)
 * Neutral: Cream/Warm whites (peace, calm, approachability)
 */

export const colors = {
  // --- Primary ---
  primary: {
    saffron: '#FF8C00',
    saffronLight: '#FFB347',
    saffronDark: '#E07800',
    deepSaffron: '#FF6B00',
  },

  // --- Secondary ---
  secondary: {
    maroon: '#4A0E0E',
    maroonLight: '#6B1A1A',
    maroonDark: '#2D0808',
  },

  // --- Accent ---
  accent: {
    gold: '#D4A017',
    goldLight: '#E8C547',
    goldDark: '#B8860B',
  },

  // --- Neutral / Background ---
  neutral: {
    cream: '#FFF8F0',
    creamDark: '#FFF3E0',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    grey50: '#F9FAFB',
    grey100: '#F3F4F6',
    grey200: '#E5E7EB',
    grey300: '#D1D5DB',
    grey400: '#9CA3AF',
    grey500: '#6B7280',
    grey600: '#4B5563',
    grey700: '#374151',
    grey800: '#1F2937',
    grey900: '#111827',
    black: '#000000',
  },

  // --- Semantic ---
  semantic: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // --- Chat Bubbles ---
  chat: {
    aiBubble: '#FFF8F0',
    userBubble: '#FFF3E0',
    timestamp: '#9CA3AF',
  },

  // --- Gradients (defined as [start, end]) ---
  gradients: {
    splash: ['#FF6B00', '#4A0E0E'] as const,
    ctaPrimary: ['#FF8C00', '#D4A017'] as const,
    cosmic: ['#0F0A2E', '#1A1145'] as const,
  },

  // --- Celestial (stars, planets, constellations) ---
  celestial: {
    starColor: '#FFD700',
    starColorDim: '#D4A017',
    planetGlow: '#FFB347',
    constellationLine: 'rgba(212,160,23,0.2)',
  },

  // --- Dosha-specific (used in animations) ---
  dosha: {
    mangal: '#E53E3E',
    shani: '#553C9A',
    rahu: '#2D3748',
    ketu: '#744210',
    pitra: '#9B2C2C',
    kaalSarp: '#1A202C',
  },

  // --- Dark Theme ---
  darkTheme: {
    pageBg: '#0F0A2E',
    pageBgAlt: '#1A1145',
    surface: '#1E1550',
    surfaceElevated: '#251A5E',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    border: 'rgba(255,255,255,0.1)',
    borderLight: 'rgba(255,255,255,0.06)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.15)',
  },

  // --- Problem Type Tiles ---
  tiles: {
    marriage_delay: { bg: '#FFE566', text: '#4A3800' },
    career_stuck: { bg: '#A8E6CF', text: '#1A3A2A' },
    money_problems: { bg: '#FFB3BA', text: '#4A1A1F' },
    health_issues: { bg: '#B5B8FF', text: '#1A1A4A' },
    legal_matters: { bg: '#87CEEB', text: '#0A2A3A' },
    family_conflict: { bg: '#FFDAB9', text: '#4A2A0A' },
    get_kundli: { bg: '#DDA0DD', text: '#3A1A3A' },
    something_else: { bg: '#98D8C8', text: '#1A3A30' },
  },
} as const;

export type ColorToken = typeof colors;

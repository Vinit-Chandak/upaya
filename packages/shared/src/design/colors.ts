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

  // --- Dosha-specific (used in animations) ---
  dosha: {
    mangal: '#E53E3E',
    shani: '#553C9A',
    rahu: '#2D3748',
    ketu: '#744210',
    pitra: '#9B2C2C',
    kaalSarp: '#1A202C',
  },
} as const;

export type ColorToken = typeof colors;

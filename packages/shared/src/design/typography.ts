/**
 * Upaya Design System — Typography
 *
 * Font families: Noto Sans (Latin) + Noto Sans Devanagari (Hindi)
 * Uses fluid typography with CSS clamp() for seamless responsive scaling.
 * All sizes scale fluidly between a mobile minimum and desktop maximum.
 *
 * Fluid formula: clamp(minSize, preferredSize, maxSize)
 * - preferredSize uses viewport-relative units (vw) for smooth scaling
 * - Breakpoint range: 320px (20rem) to 1280px (80rem)
 */

export const fontFamilies = {
  sans: '"Noto Sans", "Noto Sans Devanagari", system-ui, -apple-system, sans-serif',
  devanagari: '"Noto Sans Devanagari", "Noto Sans", sans-serif',
  mono: '"Fira Code", "Consolas", monospace',
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Fluid font sizes using clamp().
 * Each entry: [minSize, fluidSize, maxSize]
 * CSS: font-size: clamp(minSize, fluidSize, maxSize);
 */
export const fontSizes = {
  /** 12px → 14px — captions, timestamps, helper text */
  xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
  /** 14px → 16px — small body, labels, chips */
  sm: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
  /** 16px → 18px — body text, chat messages */
  base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
  /** 18px → 22px — large body, card titles */
  lg: 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
  /** 20px → 26px — section headings */
  xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.625rem)',
  /** 24px → 32px — page titles */
  '2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
  /** 30px → 40px — hero headings */
  '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
  /** 36px → 48px — splash/display text */
  '4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
  loose: 1.8,
} as const;

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.01em',
  wider: '0.025em',
} as const;

/**
 * Predefined text styles combining size, weight, line-height, and letter-spacing.
 * Use these for consistent typography across the app.
 */
export const textStyles = {
  displayLarge: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
    fontFamily: fontFamilies.sans,
  },
  displaySmall: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamilies.sans,
  },
  headingLarge: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamilies.sans,
  },
  headingMedium: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
  headingSmall: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
  bodyBase: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.sans,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.sans,
  },
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.sans,
  },
  chip: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.sans,
  },
} as const;

export type FontSize = keyof typeof fontSizes;
export type TextStyle = keyof typeof textStyles;

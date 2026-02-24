/**
 * Upaya Design System — Spacing & Layout
 *
 * Uses a fluid spacing scale that adapts to viewport size.
 * Base unit: 4px (0.25rem). All values are multiples of this base.
 *
 * For responsive behavior, key layout spacings use clamp() to scale
 * fluidly between mobile and desktop breakpoints.
 */

/** Fixed spacing scale (rem-based, consistent across viewports) */
export const spacing = {
  /** 0px */
  0: '0',
  /** 2px */
  0.5: '0.125rem',
  /** 4px */
  1: '0.25rem',
  /** 6px */
  1.5: '0.375rem',
  /** 8px */
  2: '0.5rem',
  /** 10px */
  2.5: '0.625rem',
  /** 12px */
  3: '0.75rem',
  /** 16px */
  4: '1rem',
  /** 20px */
  5: '1.25rem',
  /** 24px */
  6: '1.5rem',
  /** 32px */
  8: '2rem',
  /** 40px */
  10: '2.5rem',
  /** 48px */
  12: '3rem',
  /** 64px */
  16: '4rem',
  /** 80px */
  20: '5rem',
  /** 96px */
  24: '6rem',
} as const;

/**
 * Fluid spacing values that scale with viewport.
 * Used for page margins, section gaps, and component padding.
 */
export const fluidSpacing = {
  /** Page horizontal padding: 16px → 32px */
  pageX: 'clamp(1rem, 0.5rem + 2.5vw, 2rem)',
  /** Page vertical padding: 16px → 24px */
  pageY: 'clamp(1rem, 0.75rem + 1.25vw, 1.5rem)',
  /** Section gap: 24px → 48px */
  sectionGap: 'clamp(1.5rem, 1rem + 2.5vw, 3rem)',
  /** Card padding: 16px → 24px */
  cardPadding: 'clamp(1rem, 0.75rem + 1.25vw, 1.5rem)',
  /** Component gap: 12px → 20px */
  componentGap: 'clamp(0.75rem, 0.5rem + 1.25vw, 1.25rem)',
  /** Inline gap (between items in a row): 8px → 12px */
  inlineGap: 'clamp(0.5rem, 0.375rem + 0.625vw, 0.75rem)',
} as const;

/** Border radius tokens */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
  /** Chat bubble radius: 16px */
  chatBubble: '1rem',
  /** Card radius */
  card: '0.75rem',
  /** Chip radius */
  chip: '9999px',
  /** Button radius */
  button: '0.75rem',
} as const;

/** Responsive breakpoints (px values) */
export const breakpoints = {
  /** Small phones */
  xs: 320,
  /** Large phones */
  sm: 480,
  /** Tablets */
  md: 768,
  /** Small laptops */
  lg: 1024,
  /** Desktops */
  xl: 1280,
  /** Large screens */
  '2xl': 1536,
} as const;

/** Media query helpers (min-width) */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
} as const;

/** Common layout dimensions */
export const layout = {
  /** Maximum content width */
  maxContentWidth: '1280px',
  /** Chat message max widths */
  chatAiBubbleMaxWidth: '80%',
  chatUserBubbleMaxWidth: '75%',
  /** Bottom tab bar height */
  tabBarHeight: 'clamp(3.5rem, 3rem + 2.5vw, 4rem)',
  /** Top bar height */
  topBarHeight: 'clamp(3rem, 2.75rem + 1.25vw, 3.5rem)',
  /** AI avatar size */
  avatarSize: 'clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)',
  /** Input bar height */
  inputBarHeight: 'clamp(3rem, 2.75rem + 1.25vw, 3.5rem)',
} as const;

/** Shadow tokens */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
  bottomSheet: '0 -4px 20px rgba(0, 0, 0, 0.15)',
} as const;

/** Z-index scale */
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;

/** Animation/transition tokens */
export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export type SpacingToken = keyof typeof spacing;
export type BreakpointToken = keyof typeof breakpoints;

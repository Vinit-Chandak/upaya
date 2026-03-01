/**
 * Upaya Icon System — Shared vocabulary for SVG icons
 *
 * Actual SVG implementations live in each platform (web/mobile).
 * This module defines the shared type and metadata.
 */

export type IconName =
  | 'shriYantra'
  | 'namasteHands'
  | 'venusGlyph'
  | 'mercuryGlyph'
  | 'kundliChart'
  | 'scrollRemedy'
  | 'templeSilhouette'
  | 'playVideo'
  | 'prasadBox'
  | 'shieldLock'
  | 'starRating'
  | 'lotusSymbol'
  | 'globeIcon'
  | 'hourglassClock'
  | 'sunRise'
  | 'sunFull'
  | 'diya'
  | 'moonCrescent'
  | 'arrowRight'
  | 'marriage'
  | 'briefcase'
  | 'coinStack'
  | 'heartPulse'
  | 'scales'
  | 'family'
  | 'bookOpen'
  | 'bell'
  | 'microphone'
  | 'homeTab'
  | 'mala'
  | 'userProfile';

export type IconCategory =
  | 'astrology'
  | 'navigation'
  | 'problem'
  | 'trust'
  | 'action'
  | 'greeting';

export interface IconMeta {
  category: IconCategory;
  defaultColor: string;
}

export const ICON_META: Record<IconName, IconMeta> = {
  shriYantra: { category: 'astrology', defaultColor: '#D4A017' },
  namasteHands: { category: 'action', defaultColor: '#FF8C00' },
  venusGlyph: { category: 'astrology', defaultColor: '#D4A017' },
  mercuryGlyph: { category: 'astrology', defaultColor: '#D4A017' },
  kundliChart: { category: 'astrology', defaultColor: '#D4A017' },
  scrollRemedy: { category: 'astrology', defaultColor: '#FF8C00' },
  templeSilhouette: { category: 'astrology', defaultColor: '#FF8C00' },
  playVideo: { category: 'action', defaultColor: '#FF8C00' },
  prasadBox: { category: 'trust', defaultColor: '#FF8C00' },
  shieldLock: { category: 'trust', defaultColor: '#10B981' },
  starRating: { category: 'trust', defaultColor: '#D4A017' },
  lotusSymbol: { category: 'navigation', defaultColor: '#FF8C00' },
  globeIcon: { category: 'navigation', defaultColor: '#6B7280' },
  hourglassClock: { category: 'navigation', defaultColor: '#9CA3AF' },
  sunRise: { category: 'greeting', defaultColor: '#FF8C00' },
  sunFull: { category: 'greeting', defaultColor: '#FF8C00' },
  diya: { category: 'greeting', defaultColor: '#D4A017' },
  moonCrescent: { category: 'greeting', defaultColor: '#D4A017' },
  arrowRight: { category: 'action', defaultColor: '#FFFFFF' },
  marriage: { category: 'problem', defaultColor: '#D4A017' },
  briefcase: { category: 'problem', defaultColor: '#FF8C00' },
  coinStack: { category: 'problem', defaultColor: '#D4A017' },
  heartPulse: { category: 'problem', defaultColor: '#EF4444' },
  scales: { category: 'problem', defaultColor: '#6B7280' },
  family: { category: 'problem', defaultColor: '#FF8C00' },
  bookOpen: { category: 'problem', defaultColor: '#D4A017' },
  bell: { category: 'navigation', defaultColor: '#6B7280' },
  microphone: { category: 'action', defaultColor: '#6B7280' },
  homeTab: { category: 'navigation', defaultColor: '#6B7280' },
  mala: { category: 'navigation', defaultColor: '#FF8C00' },
  userProfile: { category: 'navigation', defaultColor: '#6B7280' },
} as const;

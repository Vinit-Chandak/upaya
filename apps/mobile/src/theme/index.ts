import { Dimensions, PixelRatio } from 'react-native';
import { colors, fontFamilies, fontWeights } from '@upaya/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Reference dimensions (iPhone 14 / standard Android)
 * All dimensions scale relative to this.
 */
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale a size value relative to screen width.
 * This ensures consistent sizing across different device sizes.
 *
 * @example
 * wp(16) // 16 on a 390px phone, scales proportionally on others
 */
export function wp(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale a size value relative to screen height.
 */
export function hp(size: number): number {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale font size with a moderation factor.
 * Uses a moderate scale to prevent fonts from becoming too large on tablets
 * or too small on compact phones.
 */
export function fp(size: number, factor: number = 0.5): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const moderated = size + (scale - 1) * factor * size;
  return Math.round(PixelRatio.roundToNearestPixel(moderated));
}

export const theme = {
  colors,

  fonts: {
    families: fontFamilies,
    weights: fontWeights,
    sizes: {
      xs: fp(12),
      sm: fp(14),
      base: fp(16),
      lg: fp(18),
      xl: fp(20),
      '2xl': fp(24),
      '3xl': fp(30),
      '4xl': fp(36),
    },
  },

  spacing: {
    xs: wp(4),
    sm: wp(8),
    md: wp(12),
    lg: wp(16),
    xl: wp(20),
    '2xl': wp(24),
    '3xl': wp(32),
    '4xl': wp(40),
    '5xl': wp(48),
  },

  borderRadius: {
    sm: wp(4),
    md: wp(8),
    lg: wp(12),
    xl: wp(16),
    '2xl': wp(24),
    full: 9999,
    chatBubble: wp(16),
    card: wp(12),
    chip: 9999,
    button: wp(12),
  },

  layout: {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    pageHorizontalPadding: wp(16),
    chatAiBubbleMaxWidth: SCREEN_WIDTH * 0.8,
    chatUserBubbleMaxWidth: SCREEN_WIDTH * 0.75,
    tabBarHeight: hp(56),
    topBarHeight: hp(48),
    avatarSize: wp(32),
    inputBarHeight: hp(48),
  },

  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
} as const;

export type Theme = typeof theme;

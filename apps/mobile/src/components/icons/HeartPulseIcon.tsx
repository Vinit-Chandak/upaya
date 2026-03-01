import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function HeartPulseIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Heart shape */}
      <Path d="M20.84 4.61C20.33 4.1 19.72 3.7 19.05 3.44C18.38 3.18 17.67 3.04 16.95 3.04C16.23 3.04 15.52 3.18 14.85 3.44C14.18 3.7 13.57 4.1 13.06 4.61L12 5.67L10.94 4.61C9.91 3.58 8.51 3.04 7.05 3.04C5.59 3.04 4.19 3.58 3.16 4.61C2.13 5.64 1.59 7.04 1.59 8.5C1.59 9.96 2.13 11.36 3.16 12.39L12 21.23L20.84 12.39C21.35 11.88 21.75 11.27 22.01 10.6C22.27 9.93 22.41 9.22 22.41 8.5C22.41 7.78 22.27 7.07 22.01 6.4C21.75 5.73 21.35 5.12 20.84 4.61Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Pulse line */}
      <Path d="M3 12H7L9 10L12 15L14 12H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

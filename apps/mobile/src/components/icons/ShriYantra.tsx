import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function ShriYantra({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Upward triangle */}
      <Path d="M12 3L21 19H3L12 3Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Downward triangle */}
      <Path d="M12 21L3 5H21L12 21Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner upward triangle */}
      <Path d="M12 8L16.5 16H7.5L12 8Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner downward triangle */}
      <Path d="M12 16L7.5 8H16.5L12 16Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Center dot */}
      <Circle cx={12} cy={12} r={1} fill={color} />
    </Svg>
  );
}

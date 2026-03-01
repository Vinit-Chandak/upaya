import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function HomeTabIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Roof */}
      <Path d="M3 9L12 2L21 9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* House body */}
      <Path d="M5 9V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Door */}
      <Path d="M10 20V14H14V20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

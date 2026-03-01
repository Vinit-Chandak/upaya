import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function CoinStackIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top coin */}
      <Path d="M4 6C4 4.9 7.58 4 12 4C16.42 4 20 4.9 20 6C20 7.1 16.42 8 12 8C7.58 8 4 7.1 4 6Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Second coin */}
      <Path d="M4 6V10C4 11.1 7.58 12 12 12C16.42 12 20 11.1 20 10V6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Third coin */}
      <Path d="M4 10V14C4 15.1 7.58 16 12 16C16.42 16 20 15.1 20 14V10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom coin */}
      <Path d="M4 14V18C4 19.1 7.58 20 12 20C16.42 20 20 19.1 20 18V14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

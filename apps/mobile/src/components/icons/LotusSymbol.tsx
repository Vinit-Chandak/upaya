import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function LotusSymbol({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Center petal */}
      <Path d="M12 3C12 3 8 8 8 12C8 16 12 18 12 18C12 18 16 16 16 12C16 8 12 3 12 3Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Left petal */}
      <Path d="M8 12C8 12 4 10 3 13C2 16 6 18 8 17" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right petal */}
      <Path d="M16 12C16 12 20 10 21 13C22 16 18 18 16 17" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Base */}
      <Path d="M8 19C9.5 20 10.5 21 12 21C13.5 21 14.5 20 16 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

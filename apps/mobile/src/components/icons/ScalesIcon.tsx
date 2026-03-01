import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function ScalesIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Center pole */}
      <Path d="M12 3V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Top pivot */}
      <Circle cx={12} cy={3} r={1} stroke={color} strokeWidth={1.5} />
      {/* Beam */}
      <Path d="M4 7H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Left pan */}
      <Path d="M4 7L2 14H8L4 7Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right pan */}
      <Path d="M20 7L16 14H22L20 7Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Base */}
      <Path d="M8 21H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

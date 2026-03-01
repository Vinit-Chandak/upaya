import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function TargetIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer circle */}
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Middle circle */}
      <Circle cx={12} cy={12} r={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner circle */}
      <Circle cx={12} cy={12} r={2} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

import React from 'react';
import Svg, { Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function BarChartIcon({ size = 24, color = '#6B7280' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left bar (short) */}
      <Line x1={6} y1={20} x2={6} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Middle bar (tall) */}
      <Line x1={12} y1={20} x2={12} y2={4} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Right bar (medium) */}
      <Line x1={18} y1={20} x2={18} y2={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
